//install event
self.addEventListener('install', e => {
    console.log('Service worker: Installed 🎉');
    e.waitUntil(
       caches.open('site-cache'),
       caches.open('image-cache'),
       caches.open('api-cache')
    );
});

//activate event
self.addEventListener('activate', e => {
    console.log('Service worker: Activated');
    e.waitUntil(
        caches.open('site-cache')
        .then(cache => {
            cache.keys().then(keys => {
                keys.forEach(key => cache.delete(key));
            })
        }),
        caches.open('image-cache')
        .then(cache => {
            cache.keys().then(keys => {
                keys.forEach(key => cache.delete(key));
            })
        }),
        caches.open('api-cache')
        .then(cache => {
            cache.keys().then(keys => {
                keys.forEach(key => cache.delete(key));
            })
        })
    )
});