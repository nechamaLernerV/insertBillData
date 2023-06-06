# insertBillData

## Description
this is a script to insert bill data to vCita business
the data that created by this script is:
1. clients
2. invoices
3. payments
4. products 
services not create because it's not supported by vCita API

## How to use
1. clone this repo
2. create new business in vCita
3. get business api key from vCita admin panel and put in createBill.js file
4. update the business to be a spammer and not send email to clients
5. check the business currency is like the currency of products
5. run the script

before you run the script again you need to comment the line that create clients and products
if you want to generate more clients and products data use https://www.mockaroo.com/