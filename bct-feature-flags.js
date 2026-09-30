/* BCT V46 runtime feature gates.
   These flags are intentionally conservative: unfinished integrations stay OFF until verified.
   Existing production behavior is unchanged unless application code explicitly checks a flag. */
(function(){
  const existing=(window.BCT_FEATURE_FLAGS&&typeof window.BCT_FEATURE_FLAGS==='object')?window.BCT_FEATURE_FLAGS:{};
  window.BCT_FEATURE_FLAGS=Object.freeze({
    ...existing,
    aiEstimating:true,
    automaticWeather:false,
    weatherManualLog:true,
    errorTelemetry:false,
    experimentalUi:false
  });
  window.bctFeatureEnabled=function(name){return window.BCT_FEATURE_FLAGS?.[name]===true;};
})();
