const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const getHTML = async (url) => {
  const { data } = await axios.get(url);
  return cheerio.load(data);
};

const DATA = [];

const parse = async (productName, page) => {
  for (let i = 1; i <= page; i++) {
    const encodedURI = encodeURI(
      `https://otc.ru/marketplace-b2b?k=${productName}&p=${i}`
    );

    let $ = await getHTML(encodedURI);

    $('.listItem_3zIzs').each((i, el) => {
      const product = {};
      product.name = $(el).find($('.name_2D3SN')).text().trim();
      product.src = $(el).find($('.name_2D3SN')).attr('href');
      product.price = $(el).find($('.price_i9KTP span')).eq(0).text();
      product.address = $(el)
        .find($('.deliveryAddressLink_cShT5'))
        .text()
        .trim();

      DATA.push(product);
    });
  }

  for (let i = 0; i < DATA.length; i++) {
    $ = await getHTML(DATA[i].src);
    const providerURL = $('.link_3oWU5').attr('href');
    const providerINN = new URL(providerURL).searchParams.get('inn');
    console.log('Loading ' + i + '/' + DATA.length);
    const provider = {};
    await axios
      .post(
        'https://otc.ru/microservices-otc/counteragent/api/counteragent/get',
        { inn: providerINN, kpp: null, externalId: null, isCustomer: false }
      )
      .then((data) => {
        provider.fullName = data.data.fullName;
      });
    await axios
      .post(
        'https://otc.ru/microservices-otc/counteragent/api/counteragent/get-reliability',
        { inn: providerINN, kpp: null, externalId: null, isCustomer: false }
      )
      .then((data) => {
        provider.description = data.data.stopResults;
      });
    await axios
      .post(
        'https://otc.ru/microservices-otc/addressbook/api/contacts/customer/search-inn',
        {
          inn: providerINN,
          customer: { inn: providerINN, kpp: null },
          categories: null,
          maxCount: 50,
        }
      )
      .then((data) => {
        provider.contacts = data.data.contacts;
      });
    DATA[i].provider = provider;
  }
  fs.writeFileSync('data.json', JSON.stringify(DATA, null, '\t'));
};

parse("бурый уголь", 1);
