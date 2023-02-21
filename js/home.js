import { $ } from './helpers.js';
import { fetchItems, searchItems, fetchDetailImages } from './data.js';
import { toggleFilters } from './main.js';

const main = $('main');
const form = $('aside form');
const dialog = $('dialog');

let page = 1;
let initialLoad = true;
export const loadHome = async () => {

    const saveFavorite = (e, item) => {
        console.log('save favorite', item);
    }

    const showDetails = (e, item) => {
        dialog.innerHTML = `
            <form method="dialog">
                <button type="submit">Close</button>
            </form>

            <section>
                <h1>${item.title}</h1>
                <p>${item.longTitle}</p>
            </section>

            <div>
                <a href="${item.links.web}" target="_blank">Bekijk op rijksmuseum</a>
                <a href="#details/${item.objectNumber}">
                    Bekijk detail pagina
                </a>
            </div>
        `;

        const detailButton = dialog.querySelector('a:last-of-type');
        detailButton.addEventListener('click', () => {
            closeDialog();
        });

        dialog.showModal();
    }

    renderSkeleton();

    const { artObjects: items } = await fetchItems(page);
    const moreresultsSection = $('main > span');

    // setTimeout(() => {
    renderHTML(items, true);
    initialLoad = false;
    // }, 2000);

    function renderHTML (items, fresh = false) {
        const resultsContainer = $('main > ul');
        if (fresh) {
            resultsContainer.innerHTML = '';
        }

        if (items.length === 0) {
            resultsContainer.innerHTML = '<li>There were no art pieces found</li>';
            return;
        }

        items.forEach(async item => {

            const { levels } = await fetchDetailImages(item.objectNumber);
            const {tiles} = levels.filter(image => image.name === "z4")[0];
            const lowestImage = tiles[0].url;

            const img = lowestImage ? lowestImage : 'https://via.placeholder.com/300x300';
            const alt = lowestImage ? item.title : `${item.title} Only available in the Rijksmuseum`;

            const li = `
            <li>
                <a href="#details/${item.objectNumber}">
                    <h3>${item.title}</h3>
                    <img data-src="${lowestImage}" alt="${alt}">
                </a>
                <section>
                    <button>❤️</button>
                    <button>ℹ️</button>
                </section>
            </li>
            `;

            resultsContainer.insertAdjacentHTML('beforeend', li);

            const lastItem = resultsContainer.lastElementChild;
            const observerImage = lastItem.querySelector('img');
            const imageOptions = {
                rootMargin: '0px 0px 200px 0px',
            }

            const imageObserver = new IntersectionObserver((entries, observer) => {

                entries.forEach(entry => {
                    const image = entry.target;
                    if (entry.isIntersecting) {
                        image.src = image.dataset.src;
                        image.onload = () => {
                            image.removeAttribute('data-src')
                            image.parentElement.parentElement.classList.add('loaded');
                        }
                        // observer.unobserve(image);
                    } else {
                        image.parentElement.parentElement.classList.remove('loaded');
                        image.dataset.src = img;
                        image.src = '';
                    }
                });
            }, imageOptions);
            imageObserver.observe(observerImage);

            const saveButton = lastItem.querySelector('button:first-of-type');
            const infoButton = lastItem.querySelector('button:last-of-type');

            saveButton.addEventListener('click', (e) => saveFavorite(e, item));
            infoButton.addEventListener('click', (e) => showDetails(e, item));
        });
    }

    let moreResultsOptions = {
        rootMargin: '0px 0px 300px 0px',
    }

    const moreResultsObserver = new IntersectionObserver(async (entries, observer) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            console.log(entry);
            console.log('more results');
            if (!initialLoad) {
                page++;
                const { artObjects: items } = await fetchItems(page);
                renderHTML(items);
            }
        }
    }, moreResultsOptions);
    moreResultsObserver.observe(moreresultsSection);

    function renderSkeleton () {
        let html = '<ul>';

        for (let i = 0; i < 10; i++) {
            html += `
                <li class="skeleton"></li>
            `;
        }

        html += '</ul><span></span>';

        main.innerHTML = html;
    }

    function closeDialog () {
        dialog.close();
        dialog.innerHTML = '';
    }

    window.addEventListener('click', (e) => {
        if (e.target === dialog && dialog.open) {
            closeDialog();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const search = form.querySelector('label:first-of-type input').value;
        const sort = form.querySelector('fieldset input:checked').value;
        const topPiece = form.querySelector('fieldset label:first-of-type input[name="top-piece"]').checked;
        const imageOnly = form.querySelector('fieldset label:last-of-type input[name="image-only"]').checked;

        toggleFilters();

        const { artObjects: items } = await searchItems(page, search, sort, topPiece, imageOnly);
        console.log(items);
        renderHTML(items, true);
    });

}