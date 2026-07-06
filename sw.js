/* Catseye / USX Pricing Guide — offline app shell (bump CACHE version on each deploy) */
var CACHE = "cseye-pg-v3";
var ASSETS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return; /* Google feeds: the app handles its own caching */
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(r){
        if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); }
        return r;
      }).catch(function(){ return hit; });
      return hit || net;   /* serve instantly from cache, refresh in background */
    })
  );
});
