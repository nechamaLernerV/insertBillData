# insertBillData

## Description
this is a script to insert bill data to vCita business
the data that created by this script is:
1. 15 clients
2. 15 products 
3. 60~ invoices
4. 60~ payments\
services not create because it's not supported by vCita API

## How to use
1. clone this repo
2. create new business in vCita
3. get business api key from vCita admin panel and put in createBill.js file
4. update the business to be a spammer and not send email to clients
5. check the business currency is like the currency of products
6. run npm install in the project folder
5. run the script\


## Notes
if you run the script again you need to comment the line that create clients and products\
you can generate more clients and products data use https://www.mockaroo.com/