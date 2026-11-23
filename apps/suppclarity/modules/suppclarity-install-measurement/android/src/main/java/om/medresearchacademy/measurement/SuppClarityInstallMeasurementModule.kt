package om.medresearchacademy.measurement

import android.content.Context
import com.facebook.FacebookSdk
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Only an SDK install receipt is exposed: no arbitrary events or health payloads. */
class SuppClarityInstallMeasurementModule : Module() {
  private val measurementLock = Any()
  private val appId = "2184159269127361"
  private fun context(): Context = requireNotNull(appContext.reactContext).applicationContext
  private fun preferences() = context().getSharedPreferences("suppclarity_ad_measurement_v1", Context.MODE_PRIVATE)
  @Suppress("DEPRECATION")
  private fun isNewInstall(): Boolean {
    val info = context().packageManager.getPackageInfo(context().packageName, 0)
    return kotlin.math.abs(info.lastUpdateTime - info.firstInstallTime) < 5000L
  }
  private fun status(): Map<String, Any> {
    val prefs = preferences()
    val consent = prefs.getString("consent", "not_asked") ?: "not_asked"
    // This pinned SDK writes ping only after Graph returns without an error.
    val acknowledged = context().getSharedPreferences("com.facebook.sdk.attributionTracking", Context.MODE_PRIVATE)
      .getLong(appId + "ping", 0) > 0
    return mapOf("consent" to consent, "receiptAcknowledged" to acknowledged,
      "initialized" to FacebookSdk.isInitialized(), "eligibleNewInstall" to isNewInstall())
  }
  @Suppress("DEPRECATION")
  private fun startAfterConsent() {
    if (preferences().getString("consent", "not_asked") != "granted") return
    if (!isNewInstall()) return
    // The manifest removes the SDK's startup provider. Nothing initializes it before this choice.
    FacebookSdk.setApplicationId(appId)
    FacebookSdk.setAutoInitEnabled(false)
    FacebookSdk.setAutoLogAppEventsEnabled(false)
    FacebookSdk.setAdvertiserIDCollectionEnabled(true)
    FacebookSdk.setLimitEventAndDataUsage(context(), true)
    FacebookSdk.sdkInitialize(context())
    FacebookSdk.fullyInitialize()
    FacebookSdk.setAutoLogAppEventsEnabled(false)
    // Restrict provider use to analytics/conversion measurement, not personalized retargeting.
    FacebookSdk.setLimitEventAndDataUsage(context(), true)
    if (preferences().getString("consent", "not_asked") == "granted") {
      FacebookSdk.publishInstallAsync(context(), appId)
    }
  }
  override fun definition() = ModuleDefinition {
    Name("SuppClarityInstallMeasurement")
    AsyncFunction("getStatus") { synchronized(measurementLock) { status() } }
    AsyncFunction("resume") { synchronized(measurementLock) {
      startAfterConsent()
      status()
    } }
    AsyncFunction("setConsent") { granted: Boolean -> synchronized(measurementLock) {
      // Commit before touching the SDK; persistence failure must never enable measurement.
      check(preferences().edit().putString("consent", if (granted) "granted" else "declined").commit())
      if (granted) {
        try { startAfterConsent() } catch (error: Exception) {
          preferences().edit().putString("consent", "declined").commit()
          if (FacebookSdk.isInitialized()) FacebookSdk.setAdvertiserIDCollectionEnabled(false)
          throw error
        }
      }
      else if (FacebookSdk.isInitialized()) {
        FacebookSdk.setAutoLogAppEventsEnabled(false)
        FacebookSdk.setAdvertiserIDCollectionEnabled(false)
        FacebookSdk.setAutoInitEnabled(false)
      }
      status()
    } }
  }
}
