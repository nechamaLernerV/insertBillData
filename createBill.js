// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const clientsData = require('./data/clients.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const productsData = require('./data/products.json');

const PaymentMethods = [
  'PayPal',
  'Other',
  'Cash',
  'Credit Card',
  'Bank Transfer',
  'Cheque',
];
let clientsWithUid = [];
let mattersWithUid = [];
let productsWithUid = [];
let invoicesWithUid = [];
let paymentsWithUid = [];

const API_KEY =
    '6a2f3a68a5cdb3a0539f698ba19bceaeb931b31b220973733e0035be7ae7e550';
const API_URL = 'https://api2.meet2know.com';


async function CreateClients() {
  try {
    for (const client of clientsData) {
      try {
        const response = await fetch(`${API_URL}/v2/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(client),
        });
        const data = await response.json();
      } catch (error) {
        throw `Error: ${error}, client: ${client.first_name} ${client.last_name}`;
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function GetClients() {
  try {
    const response = await fetch(`${API_URL}/platform/v1/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const {
      data: { clients },
    } = await response.json();
    clientsWithUid = clients;
  } catch (error) {
    console.error(error);
  }
}

async function GetMatters() {
  try {
    const response = await fetch(
        `${API_URL}/business/clients/v1/matters?filter[advanced][contains]='@'`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        },
    );
    const {
      data: { matters },
    } = await response.json();
    mattersWithUid = matters;
  } catch (error) {
    console.error(error);
  }
}

async function CreateProducts() {
  try {
    for (const index in productsData) {
      const product = productsData[index];
      try {
        const response = await fetch(
            `${API_URL}/business/payments/v1/products`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
              },
              body: JSON.stringify(product),
            },
        );
        const res = await response.json();
        if (response.status > 201)
          throw `payment ${response.status} error is ${
              res.errors
                  ? res.errors?.length > 0
                      ? res.errors[0].message
                      : 'more than one error'
                  : res.error
          }`;
      } catch (error) {
        throw `Error: ${error}, product: ${product.name}`;
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function GetProducts() {
  try {
    const response = await fetch(`${API_URL}/business/payments/v1/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const {
      data: { products },
    } = await response.json();
    productsWithUid = products;
  } catch (error) {
    console.error(error);
  }
}

async function CreateInvoices() {
  for (let i = 0; i < 60; i++) {
    try {
      const randomMatterIndex = Math.floor(
          Math.random() * mattersWithUid.length,
      );
      const randomMatter = mattersWithUid[randomMatterIndex];
      const randomClient =
          clientsWithUid.find((c) => c.id === randomMatter.contacts[0].uid) || {};
      const randomProductIndex = Math.floor(
          Math.random() * productsWithUid.length,
      );
      const randomProduct = productsWithUid[randomProductIndex];
      const randomProductIndex2 =
          randomProductIndex + 1 < productsWithUid.length
              ? randomProductIndex + 1
              : randomProductIndex - 1;
      const randomProduct2 = productsWithUid[randomProductIndex2];
      const invoice = {
        matter_uid: randomMatter.uid,
        billing_address: randomClient.address,
        currency: 'USD',
        due_date: moment().add(1, 'M').format('YYYY-MM-DD'),
        issue_date: moment().format('YYYY-MM-DD'),
        invoice_label: `invoice for ${randomClient.first_name} - ${randomProduct.name} `,
        items: [
          {
            unit_amount: randomProduct.price,
            quantity: Math.floor(Math.random() * 5) + 1,
            name: randomProduct.name,
          },
          {
            unit_amount: randomProduct2.price,
            quantity: Math.floor(Math.random() * 5) + 1,
            name: randomProduct2.name,
          },
        ],
      };
      // console.log(invoice);
      const response = await fetch(`${API_URL}/business/payments/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ invoice }),
      });
      const res = await response.json();
      if (response.status > 201) {
        throw `invoice ${response.status} error is ${
            res.errors.length > 0 ? res.errors[0].message : 'more than one error'
        }`;
      }
      const {
        data: { invoice: newInvoice },
      } = res;
      // console.log(newInvoice);
      const randomPMIndex = Math.floor(Math.random() * PaymentMethods.length);
      const randomPM = PaymentMethods[randomPMIndex];
      const payment = {
        amount: newInvoice.total,
        client_id: randomClient.id,
        currency: 'USD',
        payment_method: randomPM,
        title: `payment for ${newInvoice.invoice_number}`,
        payment_subject_type: 'Invoice',
        payment_subject_id: newInvoice.uid,
      };
      // console.log(payment);
      const response2 = await fetch(`${API_URL}/platform/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payment),
      });
      const res2 = await response2.json();
      if (response2.status > 201) {
        throw `payment ${response2.status} error is ${
            res2.errors.length > 0
                ? res2.errors[0].message
                : 'more than one error'
        }`;
      }
      const {
        data: { payment: newPayment },
      } = res2;
      // console.log(newPayment);
    } catch (error) {
      console.error(error);
    }
  }
}

async function GetInvoices() {
  try {
    const response = await fetch(`${API_URL}/platform/v1/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const {
      data: { invoices },
    } = await response.json();
    invoicesWithUid = invoices;
  } catch (error) {
    console.error(error);
  }
}

async function CreatePayments() {
  for (let i = 0; i < 60; i++) {
    try {
      const randomClientIndex = Math.floor(
          Math.random() * clientsWithUid.length,
      );
      const randomClient = clientsWithUid[randomClientIndex];
      const randomPMIndex = Math.floor(Math.random() * PaymentMethods.length);
      const randomPM = PaymentMethods[randomPMIndex];
      const randomProductIndex = Math.floor(
          Math.random() * productsWithUid.length,
      );
      const randomProduct = productsWithUid[randomProductIndex];
      const payment = {
        amount: randomProduct.price,
        client_id: randomClient.id,
        currency: 'USD',
        payment_method: randomPM,
        title: `payment for ${randomProduct.name}`,
      };
      const response = await fetch(`${API_URL}/platform/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payment),
      });
      const res = await response.json();
      if (response.status > 201)
        throw `payment ${response.status} error is ${
            res.errors
                ? res.errors?.length > 0
                    ? res.errors[0].message
                    : 'more than one error'
                : res.error
        }`;
      const {
        data: { payment: newPayment },
      } = res;
      // console.log(newPayment);
    } catch (error) {
      console.error(error);
    }
  }
}

async function GetPayments() {
  try {
    const response = await fetch(`${API_URL}/platform/v1/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    const {
      data: { payments },
    } = await response.json();
    paymentsWithUid = payments;
  } catch (error) {
    console.error(error);
  }
}
async function CreateBill() {
  await CreateClients();
  await CreateProducts();
  await GetClients();
  console.log(clientsWithUid.length);
  await GetMatters();
  console.log(mattersWithUid.length);
  await GetProducts();
  console.log(productsWithUid.length);
  await CreateInvoices();
  await GetInvoices();
  console.log(invoicesWithUid.length);
  await CreatePayments();
  await GetPayments();
  console.log(paymentsWithUid.length);
}

CreateBill();