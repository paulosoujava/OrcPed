# OrcPed
Orçamentos e Pedidos

Projeto Criado em Node
# No Frameworks!
# How to use
 - create this folders in app
 in OrcPed/app
  ```cd app
      mkdir .data
      mkdir .logs
     
      cd .data
        mkdir checks
        mkdir tokens
        mkdir users
  
     cd ..
       node index.js
        or debug mode
          NODE_DEBUG=workers  node index.js
        or production mode
         NODE_ENV=production node index.js
        default is staged
  ```

# Endpoits
```
  /checks
   payload:
      {
          "protocol" : "http",
          "url" : "google.com",
          "method" : "get",
          "successCode" : [200,201],
          "timeoutSeconds" : "3",
      }

  /tokens
    payload:
      {
          "phone" : "48999999999",
          "password" : "123123"
      }

  /users/user?id=put_your_phone

  /users 
    headers:
      token generated_token_in_end_point
    payload in body
      {
       "firstName" : "name",
        "lastName" : "last name",
        "phone" : "48 123456789",
        "password" : "123321",
        "tosAgreement" : true
      }
```

[![N|Solid](https://www.opus-software.com.br/wp-content/uploads/2018/09/nodejs-1000x423.jpg)](https://www.linkedin.com/in/paulo-oliveira-nodejs/)
