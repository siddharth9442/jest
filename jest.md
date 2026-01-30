# Jest Testing Guide

## 1. Definition and Overview

Jest is a JavaScript testing framework used to write **unit tests**, **integration tests**, and **end-to-end tests**.  
It is widely used in both **frontend** and **backend** applications.


Jest provides:
- Built-in test runner
- Assertion library
- Mocking and spying utilities
- Snapshot testing
- Fake timers

---

## 2. Setup

### Install Jest

```bash
npm install --save-dev jest
```

### Update package.json
```
{
  "scripts": {
    "test": "jest"
  }
}
```

### Create jest.config.js
```
export default {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
};
```
## 3. How Tests Are Written?

#### Basic Test Example  
```
describe("Addition Function", () => {
  it("should add two numbers", () => {
    const sum = 2 + 3;
    expect(sum).toBe(5);
  });
});
```

#### Testing an API (Example)
```
import request from "supertest";
import { app } from "../src/app.js";

describe("Auth API", () => {
  test("should login a user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
  });
});
```

In the above example, I want to test a login api.

1) Where using describe I have grouped the auth test case under 'Auth API' block
2) After that I have written test for login API.
3) Inside the callback function I have called a login API and stored response int 'res' variable.
4) Then in assertion function(expect) I have passed actual value and using matcher(toBe) I have matched it with expected value.
5) If the actual value and expected value is not matched, it will throws the error.

* **describe** 
  - Consider it as a container(block), which stores related test cases together.
  - It takes two parameters, blockName and callback function.
  - Inside the callback function, test cases are written.
  - We can use nested describe blocks, if required.
  
* **it/test**  
  - It's a test case function. there is no difference between 'test' and 'it'.
  - It's takes three parameters testName, testFunction, timeout
  - testName is the description of test case
  - testFunction is the callback function which contains actual test logic
  - timeout is the time in ms after which test case fails if not completed. (It is a optional).

* **expect()**
  - It is a Jest assertion function.
  - expect() wraps the actual value(value in the response returned from API) and allows matchers to assert conditions on it.

* **toBe()**
  - It is a **matcher**
  _ Its takes expected value and matches with the actual value