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

//fetch event
self.addEventListener('fetch', e => {
    let imageRegexp = /.jpg|.png|.jpeg|.gif|.svg|.bmp/i
    let apiRegexp = /\/api\//i

    if(imageRegexp.test(e.request.url)) {
        e.respondWith(
            fetch(e.request)
        )
    }
    else if(apiRegexp.test(e.request.url)) {
        e.respondWith(
            fetch(e.request)
        )
    }
    else {
        e.respondWith(
            fetch(e.request)
        )
    }
})