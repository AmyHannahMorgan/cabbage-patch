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
            caches.open('image-cache').then(cache => {
                return cache.match(e.request).then(response => {
                  return response || fetch(e.request).then(response => {
                    cache.put(e.request, response.clone());
                    return response;
                  });
                });
              })
        )
    }
    else if(apiRegexp.test(e.request.url)) {
        e.respondWith(
            caches.open('api-cache').then(cache => {
                return cache.match(e.request).then(response => {
                    if(response) {
                        fetch(e.request).then(fetchResponse => {
                            cache.put(e.request, fetchResponse);
                        })
                        return response;
                    }
                    else return fetch(e.request).then(response => {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                });
              })
        )
    }
    else {
        e.respondWith(
            caches.open('site-cache').then(cache => {
                return cache.match(e.request).then(response => {
                    if(response) {
                        fetch(e.request).then(fetchResponse => {
                            cache.put(e.request, fetchResponse);
                        })
                        return response;
                    }
                    else return fetch(e.request).then(response => {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                });
              })
        )
    }
})