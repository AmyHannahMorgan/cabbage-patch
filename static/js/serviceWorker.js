//install event
self.addEventListener('install', e => {
    console.log('Service worker: Installed 🎉');
    e.waitUntil(
       caches.open('site-cache'),
       caches.open('image-cache'),
       caches.open('api-cache')
    );
});