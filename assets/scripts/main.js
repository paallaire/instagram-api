/* --------------------------------------------------------------------------------
Polyfill
-------------------------------------------------------------------------------- */
import 'babel-polyfill';

// https://api.instagram.com/v1/users/self/media/recent/?access_token=9612429640.42fa86f.1b2dcfd736d747acbff98195ae01a62d
const accessToken = '9612429640.42fa86f.1b2dcfd736d747acbff98195ae01a62d';

async function fetchFeed() {
    const response = await fetch(`https://api.instagram.com/v1/users/self/media/recent/?access_token=${accessToken}`);
    const posts = await response.json();

    posts.data.forEach((item, index) => {
        const el = document.querySelector('div');
        const newEl = document.createElement('h2');
        newEl.appendChild(document.createTextNode(`ID: ${item.id}`));
        el.appendChild(newEl);

        const newPLikes = document.createElement('p');
        newPLikes.appendChild(document.createTextNode(`Like: ${item.likes.count}`));
        el.appendChild(newPLikes);

        const newPImagesUrl = document.createElement('p');
        newPImagesUrl.appendChild(document.createTextNode(`Image: ${item.images.standard_resolution.url}`));
        el.appendChild(newPImagesUrl);

        const newImage = document.createElement('img');
        newImage.src = item.images.standard_resolution.url;
        el.appendChild(newImage);
    });
}

fetchFeed();
