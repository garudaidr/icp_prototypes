import { html, render } from 'lit-html';
import { motoko_new_backend } from 'declarations/motoko_new_backend';
import logo from './logo2.svg';

class App {
  greeting = '';

  constructor() {
    this.#render();
  }

  #handleSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    this.greeting = await motoko_new_backend.greet(name);

    let _names = await motoko_new_backend.listNames();
    let _namesListHtml = '';
    const _namesList = _names.map(name => name).join('').split(',');
    _namesList.forEach(element => {
      if (element.length > 0) {
        _namesListHtml += `<li>${element}</li>`;
      }
    });
    document.getElementById('nameListSection').style.display = 'block';
    document.getElementById('nameList').innerHTML = `<ul>${_namesListHtml}</ul>`;

    this.#render();
  };

  #render() {
    let body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />
        <br />
        <form action="#">
          <label for="name">Enter your name: &nbsp;</label>
          <input id="name" alt="Name" type="text" />
          <button type="submit">Click Me!</button>
        </form>
        <section id="greeting">${this.greeting}</section>
        <section id="nameListSection">
          <label for="name">List of names</label>
          <section id="nameList"></section>
        </section>
      </main>
    `;
    render(body, document.getElementById('root'));
    document
      .querySelector('form')
      .addEventListener('submit', this.#handleSubmit);
  }
}

export default App;
