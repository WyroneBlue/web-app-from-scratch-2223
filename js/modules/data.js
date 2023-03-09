import { get } from './helpers.js';

const apiKey = 'dJcMjMTI';
const language = 'nl';
const base = `https://www.rijksmuseum.nl/api/${language}/collection`;
const baseWithKey = `${base}?key=${apiKey}`;

const itemCount = 24;
const searchItemCount = 48;

export const renderSkeleton = (list, container = true) => {

    let html = container ? '<ul>' : '';

    for (let i = 0; i < 10; i++) {
        html += `
            <li class="skeleton"></li>
        `;
    }

    html += container ? '</ul><span></span>' : '';

    list.innerHTML = html;
}

export const fetchItems = async (page) => await get(`${baseWithKey}&ps=${itemCount}&p=${page}`);
export const searchItems = async (page, search, sort, topPiece, imgOnly) => await get(`${baseWithKey}&p=${page}&ps=${searchItemCount}&q=${search}&s=${sort}&toppieces=${topPiece}&imgonly=${imgOnly}`);
export const fetchDetails = async (id) => await get(`${base}/${id}?key=${apiKey}`);
export const fetchDetailImages = async (id) => await get(`${base}/${id}/tiles?key=${apiKey}`);
