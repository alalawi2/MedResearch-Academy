-- Keep CDA distinct from thalassemia in enrollment, editing and exports.
alter type public.thal_diagnosis add value if not exists 'cda';
