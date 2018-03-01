

Application: Default Shopping Application

Node.js, Express, Handlebars

Features 

1. Customer and Admin Interface
2. Search by product (partial title acceptable)
3. Add to Cart
4. Purchase Products - logic to update quantities, check to make sure enough inventory
remains
5. Admin Purchase History - Can click on Name to filter by that customer
6. Admin Category - Add/Edit/Delete
7. Admin Product - Add/Edit/Delete
8. Admin Purchase History - Edit/Delete Purchase history


Existing Admin Login Credentials:

email: admin@admin.com
pw: 1234                            
                            
                            ***********  API EXAMPLES  *******

All Products:
------------

http://localhost:3000/api/xml/products

http://localhost:3000/api/json/products


Return Individual Product:
-------------------------

http://localhost:3000/api/xml/grapes

http://localhost:3000/api/json/grapes

http://localhost:3000/api/xml/apples

http://localhost:3000/api/json/apples



Check Price Range:
-----------------

http://localhost:3000/api/xml/price/1/10

http://localhost:3000/api/json/price/1/10

http://localhost:3000/api/xml/price/1/5

http://localhost:3000/api/json/price/1/5

http://localhost:3000/api/xml/price/5/10

http://localhost:3000/api/json/price/5/10




curl -X GET -H "Accept:application/json" "http://localhost:3000/api/json/products"
curl -X GET -H "Accept:application/xml" "http://localhost:3000/api/xml/products"

curl -X GET -H "Accept:application/json" "http://localhost:3000/api/json/grapes"
curl -X GET -H "Accept:application/xml" "http://localhost:3000/api/xml/grapes"

curl -X GET -H "Accept:application/json" "http://localhost:3000/api/json/apples"
curl -X GET -H "Accept:application/xml" "http://localhost:3000/api/xml/apples"

curl -X GET -H "Accept:application/json" "http://localhost:3000/api/json/price/1/5"
curl -X GET -H "Accept:application/xml" "http://localhost:3000/api/xml/price/1/5"




