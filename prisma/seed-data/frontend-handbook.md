# Bí kíp luyện công – Frontend Middle/Senior

Oct 1, 2026 · @Lancer

# PHẦN I – KIẾN THỨC CHUNG

## 1. JavaScript

### Tổng quan

- Ngôn ngữ thông dịch (JIT), kiểu động, đa mô hình (hướng đối tượng dựa trên prototype + functional), chạy đơn luồng, hướng sự kiện.
- Được chuẩn hoá bởi **Ecma International (TC39)** dưới tên ECMAScript, không phải W3C. W3C/WHATWG chuẩn hoá DOM và các Web API.
- Chạy ở nhiều môi trường: trình duyệt, Node.js, Deno, Bun.
- Kiểu dữ liệu: **primitive** (string, number, bigint, boolean, undefined, null, symbol) là bất biến, so sánh theo giá trị; **object** (object, array, function, date...) so sánh theo tham chiếu.

### Tính năng ES6+ cần nắm

- ES6 (2015): arrow function, template literal, `let`/`const`, destructuring, rest/spread, default parameter, class, module (`import`/`export`), Promise, iterator/generator, `Map`/`Set`/`WeakMap`/`WeakSet`, `Symbol`.
- Về sau: `async/await` (ES2017), `Object.entries/values`, optional chaining `?.` và nullish coalescing `??` (ES2020), `Array.prototype.at`, `Object.hasOwn`, `structuredClone`, `toSorted/toReversed/with` (immutable array method, ES2023).

## 2. TypeScript

- TypeScript là **superset** của JavaScript do Microsoft phát triển: thêm hệ thống kiểu tĩnh, được kiểm tra lúc **compile** rồi biên dịch (type erasure) thành JavaScript thuần. Kiểu không tồn tại ở runtime.
- Cấu hình qua `tsconfig.json` (target, module, `strict`, `paths`...). Nên bật `strict: true`.
- Lợi ích: bắt lỗi sớm, autocomplete và refactor an toàn, tài liệu sống cho code, hỗ trợ tốt cho dự án lớn.

### Kiểu cơ bản và nâng cao

- Cơ bản: `string`, `number`, `boolean`, `null`, `undefined`, `array`, `tuple`, `enum`.
- Đặc biệt: `any` (tắt kiểm tra, nên tránh), `unknown` (an toàn hơn `any`, phải thu hẹp kiểu trước khi dùng), `never` (không bao giờ xảy ra), `void`.
- **Union** `A | B`, **Intersection** `A & B`, **Literal type** (`'asc' | 'desc'`), **Generic** `<T>`, **Type alias**, **Interface**.
- **Type narrowing**: `typeof`, `instanceof`, `in`, kiểm tra đẳng thức, type guard tự định nghĩa (`x is User`), discriminated union.
- **Utility types** hay dùng: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`, `NonNullable`, `Awaited`.
- Nâng cao: **conditional type** (`T extends U ? X : Y`), **mapped type**, `keyof`, `typeof`, `infer`, template literal type, `satisfies`.

## 3. React

### Tổng quan

- Thư viện JavaScript để xây dựng UI theo hướng **component** và **declarative**: UI là hàm của state (`UI = f(state)`).
- **Virtual DOM**: React dựng cây mô tả UI trong bộ nhớ, so sánh (reconciliation/diffing) với lần render trước rồi chỉ cập nhật phần DOM thật thay đổi. Virtual DOM không tự nhanh hơn DOM thật; lợi ích chính là mô hình lập trình declarative và cập nhật hợp lý.
- **JSX** là cú pháp mở rộng, được biên dịch thành lời gọi hàm tạo element. Dữ liệu chảy **một chiều** từ cha xuống con.

### Lifecycle (class) và tương ứng với Hooks

- **Mounting**: `constructor` → `render` → `componentDidMount`.
- **Updating**: `shouldComponentUpdate` → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate`.
- **Unmounting**: `componentWillUnmount`.
- `componentDidCatch` / `getDerivedStateFromError` dùng cho **Error Boundary** (hiện vẫn chỉ viết được bằng class).
- `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` đã deprecated (đổi tên thành `UNSAFE_`), không dùng nữa.

### Hooks

- `useState`: state cục bộ. `useReducer`: state phức tạp, nhiều hành động.
- `useRef`: giữ giá trị không gây render lại, hoặc tham chiếu tới DOM.
- `useLayoutEffect`: chạy đồng bộ sau khi DOM cập nhật, trước khi trình duyệt vẽ (dùng để đo layout).
- `useContext`: đọc context. `useId`: tạo id ổn định giữa server và client.
- Concurrent: `useTransition`, `useDeferredValue`; `useSyncExternalStore` cho store bên ngoài React.
- Cách dùng `useEffect`, `useMemo`, `useCallback` và quy tắc của Hooks: xem Phần II.

### Các chủ đề khác

- **Styling**: inline style, CSS/CSS Modules, CSS-in-JS (styled-components, Emotion), utility-first (Tailwind). Với Server Components nên cân nhắc CSS Modules/Tailwind vì nhiều thư viện CSS-in-JS cần runtime phía client.
- **Router**: `BrowserRouter` dùng History API; `Route` ánh xạ URL với component.

## 4. Next.js

### Tổng quan

- Next.js là framework full-stack dựa trên React, do **Vercel** phát triển (trước đây là Zeit). Cung cấp sẵn routing theo file, nhiều chiến lược render, API/route handler, tối ưu ảnh/font, middleware, bundler (Turbopack/Webpack) và compiler (SWC).

### GraphQL với Apollo Client

- Dùng `ApolloClient` + `InMemoryCache` + `ApolloProvider`; `useQuery` cho query, `useMutation` cho mutation. Kết quả được cache cục bộ tự động.

# PHẦN II – CÂU HỎI PHỎNG VẤN

## 1. JavaScript

**1. What is a closure and when do you use it? / Closure là gì và dùng khi nào?**

EN: A closure is a function that remembers the variables of the scope where it was created, even after that scope has finished. It is used for private state, factories, memoization, and debounce/throttle. Be careful: holding references for too long can cause memory leaks.

VI: Closure là hàm ghi nhớ các biến của scope nơi nó được tạo, kể cả khi scope đó đã chạy xong. Dùng cho private state, factory, memoize, debounce/throttle. Cần lưu ý giữ tham chiếu quá lâu có thể gây memory leak.

**2. Difference between `var`, `let`, `const`? What is hoisting and the TDZ? / Khác nhau giữa `var`, `let`, `const`? Hoisting và TDZ là gì?**

EN: `var` is function-scoped and hoisted as `undefined`; `let`/`const` are block-scoped and hoisted but stay in the Temporal Dead Zone until their declaration line, so early access throws a `ReferenceError`. `const` forbids reassignment, not mutation of the object it points to.

VI: `var` có function scope và được hoist với giá trị `undefined`; `let`/`const` có block scope, cũng được hoist nhưng nằm trong Temporal Dead Zone đến dòng khai báo nên truy cập sớm sẽ ném `ReferenceError`. `const` cấm gán lại, không cấm thay đổi nội dung object nó trỏ tới.

**3. How is `this` determined? / `this` được xác định như thế nào?**

EN: By how the function is called: plain call (global or `undefined` in strict mode), method call (the object before the dot), `new` (the new instance), `call/apply/bind` (explicit). Arrow functions have no own `this`; they inherit it lexically.

VI: Tuỳ cách gọi hàm: gọi thường (global hoặc `undefined` ở strict mode), gọi method (object trước dấu chấm), `new` (instance mới), `call/apply/bind` (chỉ định tường minh). Arrow function không có `this` riêng mà kế thừa từ scope bao ngoài.

**4. `call`, `apply`, `bind`: what is the difference? / Khác nhau giữa `call`, `apply`, `bind`?**

EN: `call(thisArg, a, b)` and `apply(thisArg, [a, b])` invoke the function immediately (arguments listed vs. as an array). `bind(thisArg, ...)` returns a new function with `this` fixed, to be called later.

VI: `call(thisArg, a, b)` và `apply(thisArg, [a, b])` gọi hàm ngay (truyền đối số rời hoặc theo mảng). `bind(thisArg, ...)` trả về một hàm mới đã cố định `this`, để gọi sau.

**5. JavaScript is single-threaded. Why can it run asynchronously? Explain the Event Loop. / JS đơn luồng, tại sao vẫn chạy bất đồng bộ? Giải thích Event Loop.**

EN: Slow work (timers, network, I/O) is handled by the host environment (browser Web APIs, Node's libuv), not the JS thread. When finished, callbacks are queued. The event loop runs the call stack to empty, drains **all** microtasks (Promise callbacks), then takes **one** macrotask (`setTimeout`, UI events), and repeats.

VI: Tác vụ chậm (timer, network, I/O) do môi trường chạy xử lý (Web API của trình duyệt, libuv của Node), không chiếm luồng JS. Xong thì callback được xếp hàng. Event loop chạy hết call stack, xử lý **toàn bộ** microtask (callback của Promise), rồi lấy **một** macrotask (`setTimeout`, sự kiện UI), và lặp lại.

**6. What is the output order? / Thứ tự in ra là gì?**

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```

EN: `A, D, C, B`. Synchronous code first, then the microtask (`C`), then the macrotask (`B`).

VI: `A, D, C, B`. Code đồng bộ chạy trước, rồi đến microtask (`C`), cuối cùng là macrotask (`B`).

**7. Callback vs Promise vs async/await? / So sánh Callback, Promise, async/await?**

EN: Callbacks lead to nested "callback hell" and scattered error handling. Promises (ES2015) are chainable with `then/catch` and have three states: pending, fulfilled, rejected. `async/await` (ES2017) is syntax sugar over Promises that reads like synchronous code and uses `try/catch`. Remember that `await` only pauses the surrounding async function, not the thread.

VI: Callback dễ gây "callback hell" và xử lý lỗi rời rạc. Promise (ES2015) nối chuỗi được bằng `then/catch`, có ba trạng thái: pending, fulfilled, rejected. `async/await` (ES2017) là cú pháp bọc trên Promise, đọc như code đồng bộ và dùng `try/catch`. Lưu ý `await` chỉ tạm dừng hàm async chứa nó, không chặn luồng.

**8. `Promise.all` vs `allSettled` vs `race` vs `any`? / Khác nhau giữa các Promise combinator?**

EN: `all` resolves when all succeed and rejects on the first failure. `allSettled` waits for all and reports each result. `race` settles with the first promise to settle. `any` resolves with the first success and rejects only if all fail.

VI: `all` resolve khi tất cả thành công, reject ngay khi có một cái lỗi. `allSettled` đợi tất cả xong và trả kết quả từng cái. `race` lấy kết quả của promise xong đầu tiên (thành công hoặc lỗi). `any` lấy cái thành công đầu tiên, chỉ reject khi tất cả đều lỗi.

**9. `==` vs `===`? / Khác nhau giữa `==` và `===`?**

EN: `==` coerces types before comparing (`0 == false` is `true`), `===` compares value and type (`0 === false` is `false`). Default to `===`; the only common use of `==` is `x == null` to match both `null` and `undefined`.

VI: `==` ép kiểu rồi mới so sánh (`0 == false` là `true`), `===` so sánh cả giá trị lẫn kiểu (`0 === false` là `false`). Mặc định dùng `===`; trường hợp `==` hay gặp là `x == null` để khớp cả `null` và `undefined`.

Falsy values / Giá trị falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy, including `[]` and `{}` / Mọi giá trị khác đều truthy, kể cả `[]` và `{}`.

**10. How does prototypal inheritance work? / Kế thừa prototype hoạt động ra sao?**

EN: Every object has an internal `[[Prototype]]` link. When a property is not found on the object, JS walks up the prototype chain until it finds it or reaches `null`. ES6 `class` is syntax sugar over this mechanism.

VI: Mỗi object có liên kết nội bộ `[[Prototype]]`. Khi không tìm thấy thuộc tính trên object, JS đi ngược lên prototype chain đến khi thấy hoặc gặp `null`. `class` của ES6 chỉ là cú pháp bọc trên cơ chế này.

**11. Shallow copy vs deep copy? How to deep copy? / Shallow copy và deep copy khác nhau thế nào? Deep copy bằng cách nào?**

EN: A shallow copy (`{...obj}`, `Object.assign`, `slice`) copies only the first level; nested objects are still shared. A deep copy duplicates everything: use `structuredClone(obj)`. `JSON.parse(JSON.stringify(obj))` is lossy (drops functions, `undefined`, `Date` becomes a string, fails on circular references).

VI: Shallow copy (`{...obj}`, `Object.assign`, `slice`) chỉ sao chép cấp đầu, object lồng bên trong vẫn dùng chung tham chiếu. Deep copy sao chép toàn bộ: dùng `structuredClone(obj)`. `JSON.parse(JSON.stringify(obj))` bị mất dữ liệu (bỏ function, `undefined`, `Date` thành chuỗi, lỗi với tham chiếu vòng).

**12. Debounce vs throttle? / Debounce và throttle khác nhau thế nào?**

EN: Debounce runs the function only after events stop for N ms (search-as-you-type). Throttle runs it at most once every N ms during a stream of events (scroll, resize).

VI: Debounce chỉ chạy hàm sau khi sự kiện ngừng N ms (tìm kiếm khi gõ). Throttle chạy tối đa một lần mỗi N ms trong lúc sự kiện liên tục xảy ra (scroll, resize).

**13. What are event bubbling, capturing, and delegation? / Event bubbling, capturing và delegation là gì?**

EN: An event travels from the root down to the target (capturing), then back up (bubbling). Delegation attaches one listener to a parent and uses `event.target` to handle many children, saving memory and working for dynamically added elements. `stopPropagation()` stops the travel; `preventDefault()` cancels the default action.

VI: Sự kiện đi từ gốc xuống phần tử đích (capturing), rồi đi ngược lên (bubbling). Delegation gắn một listener ở phần tử cha và dùng `event.target` để xử lý nhiều phần tử con, tiết kiệm bộ nhớ và hoạt động cả với phần tử thêm động. `stopPropagation()` dừng lan truyền; `preventDefault()` huỷ hành vi mặc định.

**14. What are common causes of memory leaks in JavaScript? / Nguyên nhân phổ biến gây memory leak trong JS?**

EN: Forgotten timers/intervals, event listeners never removed, closures holding large objects, detached DOM nodes still referenced, and unbounded global caches. Fix with cleanup (`clearInterval`, `removeEventListener`, `AbortController`), `WeakMap`/`WeakRef` where suitable, and heap snapshots in DevTools.

VI: Timer/interval quên huỷ, event listener không gỡ, closure giữ object lớn, DOM node đã tách nhưng vẫn còn được tham chiếu, cache toàn cục phình mãi. Cách xử lý: dọn dẹp (`clearInterval`, `removeEventListener`, `AbortController`), dùng `WeakMap`/`WeakRef` khi phù hợp, và kiểm tra heap snapshot trong DevTools.

**15. ES Modules vs CommonJS? / ES Modules khác CommonJS thế nào?**

EN: ESM (`import/export`) is the standard: static (enables tree shaking), asynchronous, with live bindings. CommonJS (`require/module.exports`) is Node's legacy format: dynamic, synchronous, exports are copied values.

VI: ESM (`import/export`) là chuẩn của ngôn ngữ: phân tích tĩnh (cho phép tree shaking), bất đồng bộ, binding "sống". CommonJS (`require/module.exports`) là định dạng cũ của Node: động, đồng bộ, giá trị export là bản sao.

**16. How does the JavaScript engine run code? What are the call stack, heap and execution context? / Engine JS chạy code như thế nào? Call stack, heap và execution context là gì?**

EN: The engine (e.g. V8) parses code into an AST, compiles it to bytecode and JIT-compiles hot code to machine code. The **heap** stores objects; the **call stack** tracks running functions (LIFO). Each function call creates an **execution context** with a creation phase (scope, hoisting, `this`) and an execution phase. Variables are resolved through the **lexical scope chain**, which is what makes closures possible. Unreachable objects are reclaimed by garbage collection (mark-and-sweep).

VI: Engine (ví dụ V8) parse code thành AST, biên dịch ra bytecode và JIT các đoạn chạy nhiều thành machine code. **Heap** chứa object; **call stack** theo dõi các hàm đang chạy (LIFO). Mỗi lần gọi hàm tạo một **execution context** gồm pha creation (scope, hoisting, `this`) và pha execution. Biến được tra qua **lexical scope chain**, đó là cơ sở của closure. Object không còn truy cập được sẽ bị garbage collector dọn (mark-and-sweep).

**17. What is the difference between microtasks and macrotasks, and what happens if one blocks? / Microtask và macrotask khác nhau thế nào, nếu một tác vụ chạy lâu thì sao?**

EN: Microtasks (Promise callbacks, `await`, `queueMicrotask`) are drained completely after the current task and before rendering; macrotasks (`setTimeout`, UI events, I/O) run one per loop turn. A long synchronous task or an endless microtask chain blocks rendering and input. Split work into chunks, yield with `setTimeout`/`scheduler.yield()`, or move heavy computation to a Web Worker. Also note: setTimeout(fn, 0) never runs immediately, and in Node.js process.nextTick runs before Promise microtasks.

VI: Microtask (callback Promise, `await`, `queueMicrotask`) được xử lý hết sau tác vụ hiện tại và trước khi render; macrotask (`setTimeout`, sự kiện UI, I/O) mỗi vòng lặp chạy một cái. Tác vụ đồng bộ dài hoặc chuỗi microtask vô tận sẽ chặn render và input. Cách xử lý: chia nhỏ công việc, nhường luồng bằng `setTimeout`/`scheduler.yield()`, hoặc chuyển tính toán nặng sang Web Worker. Lưu ý thêm: setTimeout(fn, 0) không bao giờ chạy ngay lập tức, và trong Node.js process.nextTick chạy trước microtask của Promise.

**18. Implement `debounce`. / Viết hàm `debounce`.**

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

EN: Each call resets the timer, so `fn` runs only after calls stop for `delay` ms. A closure keeps `timer`, and `apply` preserves `this` and the arguments. Common follow-ups: leading/trailing options, a `cancel()` method, and cancelling on component unmount.

VI: Mỗi lần gọi sẽ đặt lại timer, nên `fn` chỉ chạy khi các lần gọi dừng đủ `delay` ms. Closure giữ biến `timer`, `apply` giữ nguyên `this` và đối số. Câu hỏi nối tiếp thường gặp: tuỳ chọn leading/trailing, thêm method `cancel()`, và huỷ khi component unmount.

**19. Implement `Promise.all`. / Tự viết `Promise.all`.**

```js
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    if (items.length === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;
        if (++done === items.length) resolve(results);
      }, reject);
    });
  });
}
```

EN: Key points: keep results in input order (by index, not completion order), wrap non-promise values with `Promise.resolve`, reject on the first failure, and resolve immediately for an empty array.

VI: Điểm mấu chốt: giữ kết quả theo thứ tự đầu vào (theo index, không theo thứ tự hoàn thành), bọc giá trị không phải promise bằng `Promise.resolve`, reject ngay khi có lỗi đầu tiên, và resolve ngay với mảng rỗng.

## 2. TypeScript

**1. Why use TypeScript over JavaScript? / Vì sao dùng TypeScript thay vì JavaScript?**

EN: Static types catch bugs at compile time, power autocomplete and safe refactoring, and document intent, which matters most in large codebases and teams. Types are erased at build time, so there is no runtime cost, but also no runtime validation.

VI: Kiểu tĩnh giúp bắt lỗi lúc compile, hỗ trợ autocomplete, refactor an toàn và làm tài liệu cho code, rất hữu ích với dự án lớn và làm việc nhóm. Kiểu bị xoá khi build nên không tốn chi phí runtime, nhưng cũng không validate dữ liệu lúc chạy.

**2. `interface` vs `type`? / Khác nhau giữa `interface` và `type`?**

EN: Both describe object shapes. `interface` supports declaration merging and `extends`; `type` can also express unions, intersections, tuples, primitives and conditional/mapped types. Rule of thumb: `interface` for public object contracts, `type` for unions and computed types.

VI: Cả hai đều mô tả hình dạng object. `interface` hỗ trợ declaration merging và `extends`; `type` còn biểu diễn được union, intersection, tuple, primitive và conditional/mapped type. Quy ước: `interface` cho hợp đồng object công khai, `type` cho union và kiểu tính toán.

**3. `any` vs `unknown` vs `never`? / Khác nhau giữa `any`, `unknown`, `never`?**

EN: `any` disables type checking. `unknown` accepts any value but forces you to narrow the type before using it, so it is the safe choice. `never` is the type of values that never occur (functions that always throw, exhaustive checks).

VI: `any` tắt kiểm tra kiểu. `unknown` nhận mọi giá trị nhưng bắt buộc thu hẹp kiểu trước khi dùng nên an toàn hơn. `never` là kiểu của giá trị không bao giờ xảy ra (hàm luôn ném lỗi, kiểm tra vét cạn).

**4. What are generics? Give an example. / Generic là gì? Cho ví dụ.**

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2]);   // number | undefined
first(['a']);    // string | undefined
```

EN: Generics let you write reusable code that keeps type information, with the concrete type decided by the caller. You can constrain them: `<T extends { id: string }>`.

VI: Generic cho phép viết code tái sử dụng mà vẫn giữ thông tin kiểu; kiểu cụ thể do nơi gọi quyết định. Có thể ràng buộc: `<T extends { id: string }>`.

**5. What is type narrowing? / Type narrowing là gì?**

EN: Refining a broad type to a specific one inside a branch, using `typeof`, `instanceof`, `in`, equality checks, custom type guards (`x is User`), or a discriminated union (a shared literal field such as `kind`).

VI: Thu hẹp một kiểu rộng thành kiểu cụ thể trong một nhánh code, bằng `typeof`, `instanceof`, `in`, so sánh bằng, type guard tự định nghĩa (`x is User`), hoặc discriminated union (trường literal chung như `kind`).

**6. Name some utility types. / Kể tên vài utility type.**

EN: `Partial<T>` (all optional), `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`, `NonNullable<T>`, `Awaited<T>`.

VI: `Partial<T>` (mọi thuộc tính tuỳ chọn), `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`, `NonNullable<T>`, `Awaited<T>`.

**7. Does TypeScript validate API responses at runtime? / TypeScript có kiểm tra dữ liệu API lúc runtime không?**

EN: No. Types exist only at compile time, so a typed `fetch` result can still be wrong. Validate at the boundary with a schema library (e.g. Zod) or type guards, and infer the type from the schema.

VI: Không. Kiểu chỉ tồn tại lúc compile nên kết quả `fetch` có gán kiểu vẫn có thể sai. Cần validate ở ranh giới bằng thư viện schema (ví dụ Zod) hoặc type guard, và suy ra kiểu từ schema.

**8. What does `strict` mode enable and why use it? / `strict` bật những gì và vì sao nên dùng?**

EN: It turns on a group of checks including `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` and `strictPropertyInitialization`. It prevents the most common bugs (null/undefined access, implicit `any`), so new projects should enable it.

VI: Bật một nhóm kiểm tra gồm `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictPropertyInitialization`. Nó ngăn các lỗi phổ biến nhất (truy cập null/undefined, `any` ngầm), nên dự án mới cần bật.

**9. What is structural typing? / Structural typing là gì?**

EN: Compatibility is decided by shape, not by declared name. If an object has all required properties of a type, it is assignable to it, even without explicitly implementing it.

VI: Tính tương thích được quyết định bởi cấu trúc, không phải tên khai báo. Object có đủ các thuộc tính bắt buộc của một kiểu thì gán được cho kiểu đó, dù không khai báo implement rõ ràng.

## 3. React

**1. What is the Virtual DOM and how does reconciliation work? / Virtual DOM là gì và reconciliation hoạt động thế nào?**

EN: The Virtual DOM is an in-memory tree describing the UI. On each update React builds a new tree, diffs it against the previous one (reconciliation), and applies only the minimal changes to the real DOM. It relies on two heuristics: elements of different types produce different trees, and `key` identifies items in a list. Its main benefit is the declarative model, not raw speed.

VI: Virtual DOM là cây mô tả UI nằm trong bộ nhớ. Mỗi lần cập nhật React dựng cây mới, so sánh với cây cũ (reconciliation) rồi chỉ áp dụng thay đổi tối thiểu lên DOM thật. Nó dựa trên hai quy tắc: element khác loại thì tạo cây khác, và `key` định danh phần tử trong list. Lợi ích chính là mô hình declarative, không phải tốc độ thuần.

**2. Props vs State? / Khác nhau giữa props và state?**

EN: Props are inputs passed from parent to child and are read-only. State is data owned by a component that changes over time and triggers re-render. Data flows one way, top-down; children communicate upward through callback props.

VI: Props là đầu vào cha truyền cho con, chỉ đọc. State là dữ liệu do chính component sở hữu, thay đổi theo thời gian và kích hoạt render lại. Dữ liệu chảy một chiều từ trên xuống; con báo ngược lên cha qua callback truyền bằng props.

**3. Why must we not mutate state directly? / Vì sao không được sửa state trực tiếp?**

EN: React detects changes by reference. Mutating in place keeps the same reference, so React may skip re-rendering and memoization breaks. Always create new objects/arrays (`setList([...list, item])`). Updates are batched and asynchronous, so use the functional form `setCount(c => c + 1)` when the next value depends on the previous one.

VI: React phát hiện thay đổi bằng so sánh tham chiếu. Sửa trực tiếp giữ nguyên tham chiếu nên React có thể bỏ qua render và memo hoá hỏng. Luôn tạo object/mảng mới (`setList([...list, item])`). Cập nhật state được gộp và bất đồng bộ, nên khi giá trị mới phụ thuộc giá trị cũ hãy dùng dạng hàm `setCount(c => c + 1)`.

**4. Function components vs class components? / Function component khác class component thế nào?**

EN: Function components are plain functions that use Hooks for state and effects. Class components use `this.state` and lifecycle methods. Since React 16.8 function components can do everything except Error Boundaries, and they are the recommended standard: less boilerplate, no `this`, and logic is reusable through custom hooks. Performance is essentially equivalent.

VI: Function component là hàm thuần, dùng Hooks cho state và effect. Class component dùng `this.state` và các lifecycle method. Từ React 16.8, function component làm được mọi thứ trừ Error Boundary, và là chuẩn khuyến nghị: ít boilerplate, không có `this`, tái sử dụng logic qua custom hook. Hiệu năng về cơ bản tương đương.

**5. Explain `useEffect` and its dependency array. / Giải thích `useEffect` và mảng dependency.**

EN: `useEffect` runs side effects after render. No array: runs after every render. `[]`: runs once after mount. `[a, b]`: runs when `a` or `b` changes. The returned function is the cleanup, run before the next effect and on unmount. Always list every reactive value used inside (the `exhaustive-deps` lint rule), and don't use effects for logic that can be computed during render or handled in an event handler.

VI: `useEffect` chạy side effect sau khi render. Không có mảng: chạy sau mọi lần render. `[]`: chạy một lần sau mount. `[a, b]`: chạy khi `a` hoặc `b` đổi. Hàm trả về là cleanup, chạy trước effect kế tiếp và khi unmount. Luôn khai báo đủ mọi giá trị reactive dùng bên trong (rule lint `exhaustive-deps`), và đừng dùng effect cho logic có thể tính ngay lúc render hoặc xử lý trong event handler.

**6. `useMemo` vs `useCallback` vs `React.memo`? / Khác nhau giữa `useMemo`, `useCallback`, `React.memo`?**

EN: `useMemo` caches a computed **value**. `useCallback` caches a **function** reference. `React.memo` wraps a **component** so it skips re-rendering when props are shallowly equal. They work together: `memo` is useless if you pass a new object or function every render, which is where `useMemo`/`useCallback` stabilize references. Measure first; do not memoize everything.

VI: `useMemo` ghi nhớ một **giá trị** đã tính. `useCallback` ghi nhớ tham chiếu của một **hàm**. `React.memo` bọc **component** để bỏ qua render khi props bằng nhau theo so sánh nông. Chúng đi cùng nhau: `memo` vô tác dụng nếu mỗi lần render truyền object/hàm mới, lúc đó `useMemo`/`useCallback` giữ tham chiếu ổn định. Hãy đo trước, không memo hoá tràn lan.

**7. Why do we need `key` in lists? / Vì sao list cần `key`?**

EN: `key` lets React match items between renders to reuse, move or remove the right DOM/state. Use a stable unique id. Using the array index breaks state and order when items are inserted, removed or reordered.

VI: `key` giúp React khớp phần tử giữa các lần render để tái sử dụng, di chuyển hoặc xoá đúng DOM/state. Dùng id ổn định và duy nhất. Dùng index của mảng sẽ làm sai state và thứ tự khi chèn, xoá hoặc đổi chỗ phần tử.

**8. Controlled vs uncontrolled components? / Controlled và uncontrolled component khác nhau thế nào?**

EN: In a controlled component the input value lives in React state and changes via `onChange`. In an uncontrolled one the DOM holds the value and you read it with a `ref`. Controlled gives full control and validation; uncontrolled is simpler and cheaper for large forms (React Hook Form uses this approach to avoid re-renders).

VI: Controlled component: giá trị input nằm trong state của React và đổi qua `onChange`. Uncontrolled: DOM giữ giá trị, đọc qua `ref`. Controlled cho toàn quyền kiểm soát và validate; uncontrolled đơn giản và nhẹ hơn với form lớn (React Hook Form dùng cách này để tránh render lại).

**9. How do you manage state in a large app? / Quản lý state trong app lớn như thế nào?**

EN: Keep state as local as possible. Share via lifting state up or Context (good for rarely changing data like theme or user). For complex client state use Redux Toolkit, Zustand or Jotai. Treat **server state** (API data, caching, refetching) separately with TanStack Query or SWR, and keep URL and form state in their own tools.

VI: Giữ state càng cục bộ càng tốt. Chia sẻ bằng cách nâng state lên hoặc Context (hợp với dữ liệu ít đổi như theme, user). Với client state phức tạp dùng Redux Toolkit, Zustand hoặc Jotai. Tách riêng **server state** (dữ liệu API, cache, refetch) và dùng TanStack Query hoặc SWR; state của URL và form dùng công cụ riêng.

**10. How does Redux work? / Redux hoạt động như thế nào?**

EN: One-way flow: the UI dispatches an action, a pure reducer takes the current state and the action and returns new state, the store updates and subscribed components re-render. Async work goes through middleware such as Redux Thunk (dispatching functions). Today use Redux Toolkit, which removes most boilerplate and includes Immer.

VI: Luồng một chiều: UI dispatch action, reducer (hàm thuần) nhận state hiện tại cùng action và trả state mới, store cập nhật và các component đã subscribe render lại. Tác vụ bất đồng bộ đi qua middleware như Redux Thunk (dispatch hàm). Hiện nay dùng Redux Toolkit để giảm boilerplate và có sẵn Immer.

**11. What are the problems with Context? / Context có hạn chế gì?**

EN: When the context value changes, every consumer re-renders, even if it uses only part of the value. Mitigate by splitting contexts, memoizing the value, or using a state library with selectors.

VI: Khi giá trị context đổi, mọi consumer đều render lại dù chỉ dùng một phần giá trị. Giảm thiểu bằng cách tách context, memo hoá giá trị, hoặc dùng thư viện state có selector.

**12. How do you optimize React performance? / Tối ưu hiệu năng React bằng cách nào?**

EN: Profile first (React DevTools Profiler). Then: move state closer to where it is used, split components, stable `key`s, `React.memo`/`useMemo`/`useCallback` where measured, code splitting with `React.lazy` and `Suspense`, virtualize long lists, debounce inputs, and use `useTransition` for non-urgent updates.

VI: Đo trước bằng React DevTools Profiler. Sau đó: đưa state xuống gần nơi dùng, tách component, `key` ổn định, `React.memo`/`useMemo`/`useCallback` ở chỗ đã đo thấy cần, code splitting với `React.lazy` và `Suspense`, virtualize list dài, debounce input, và `useTransition` cho cập nhật không khẩn cấp.

**13. What are custom hooks and the rules of hooks? / Custom hook và các quy tắc của Hooks?**

EN: A custom hook is a function starting with `use` that composes other hooks to reuse stateful logic (e.g. `useDebounce`, `useFetch`). Rules: call hooks only at the top level (never inside conditions or loops) and only from function components or other hooks, because React relies on call order.

VI: Custom hook là hàm bắt đầu bằng `use`, kết hợp các hook khác để tái sử dụng logic có state (ví dụ `useDebounce`, `useFetch`). Quy tắc: chỉ gọi hook ở top level (không trong điều kiện hay vòng lặp) và chỉ trong function component hoặc hook khác, vì React dựa vào thứ tự gọi.

**14. What is an Error Boundary? / Error Boundary là gì?**

EN: A class component with `componentDidCatch`/`getDerivedStateFromError` that catches errors thrown during rendering of its children and shows a fallback UI. It does not catch errors in event handlers or async code. Libraries like `react-error-boundary` provide a function-friendly wrapper.

VI: Là class component có `componentDidCatch`/`getDerivedStateFromError`, bắt lỗi ném ra khi render các component con và hiển thị UI dự phòng. Nó không bắt lỗi trong event handler hay code bất đồng bộ. Thư viện như `react-error-boundary` cung cấp wrapper dùng được với function component.

**15. How do you test React components? / Test component React như thế nào?**

EN: Jest (runner, assertions, mocks, snapshots) plus React Testing Library, which queries the UI the way a user does (by role, label, text) and avoids testing implementation details. Mock network calls (e.g. MSW), and use E2E tools (Playwright, Cypress) for critical flows. Use snapshots sparingly because they are brittle.

VI: Jest (runner, assertion, mock, snapshot) kết hợp React Testing Library, truy vấn UI giống người dùng (theo role, label, text) và tránh test chi tiết cài đặt. Mock network (ví dụ MSW), dùng E2E (Playwright, Cypress) cho luồng quan trọng. Snapshot dễ vỡ nên dùng có chọn lọc.

**16. What changed in React 18 and 19? / React 18 và 19 có gì mới?**

EN: React 18: concurrent rendering, automatic batching, `Suspense` improvements, `useTransition`/`useDeferredValue`. React 19: Actions and `useActionState`/`useOptimistic`, the `use` API, stable Server Components, `ref` as a regular prop, and a stronger ecosystem story around the React Compiler for automatic memoization.

VI: React 18: concurrent rendering, automatic batching, cải tiến `Suspense`, `useTransition`/`useDeferredValue`. React 19: Actions cùng `useActionState`/`useOptimistic`, API `use`, Server Components ổn định, `ref` như prop thường, và React Compiler để tự động memo hoá.

**17. What are Server Components? / Server Components là gì?**

EN: Components that render only on the server and send their result (not their JS) to the client, so they can read databases or call APIs directly and reduce bundle size. They cannot use state, effects or browser APIs; interactive parts are marked `'use client'`.

VI: Component chỉ render trên server và gửi kết quả (không gửi JS của chúng) xuống client, nên có thể đọc database hoặc gọi API trực tiếp và giảm kích thước bundle. Chúng không dùng được state, effect hay API trình duyệt; phần tương tác được đánh dấu `'use client'`.

**18. What is React Fiber and how does concurrent rendering work? / React Fiber là gì, concurrent rendering hoạt động thế nào?**

EN: Fiber (since React 16) is the reconciliation engine that splits rendering into small units of work, so React can pause, prioritize and resume it. There are two phases: **render** (pure and interruptible, computes what changed) and **commit** (synchronous, applies DOM changes, then runs layout effects and effects). Concurrent features in React 18 (`useTransition`, `Suspense`) build on this: urgent updates like typing can interrupt non-urgent ones. That is why render must be pure, and why StrictMode double-invokes it in development.

VI: Fiber (từ React 16) là engine reconciliation chia việc render thành các đơn vị nhỏ, để React có thể tạm dừng, ưu tiên và tiếp tục. Có hai pha: **render** (thuần, có thể bị ngắt, tính ra phần thay đổi) và **commit** (đồng bộ, áp thay đổi lên DOM, rồi chạy layout effect và effect). Các tính năng concurrent của React 18 (`useTransition`, `Suspense`) dựa trên cơ chế này: cập nhật khẩn cấp như gõ phím có thể ngắt cập nhật không khẩn cấp. Vì vậy hàm render phải thuần, và StrictMode gọi render hai lần ở môi trường dev.

**19. How do you avoid race conditions when fetching data in React? / Tránh race condition khi fetch dữ liệu trong React thế nào?**

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/search?q=${q}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [q]);
```

EN: When a dependency changes quickly (e.g. a search box), an older request can resolve after a newer one and overwrite fresh data. Cancel the previous request in the effect cleanup with `AbortController`, or ignore stale results with a flag. In real projects prefer TanStack Query or SWR, which handle caching, deduplication, cancellation and retries, and avoid request waterfalls.

VI: Khi dependency đổi nhanh (ví dụ ô tìm kiếm), request cũ có thể trả về sau request mới và ghi đè dữ liệu mới. Huỷ request trước trong cleanup của effect bằng `AbortController`, hoặc bỏ qua kết quả cũ bằng một cờ. Trong dự án thực tế nên dùng TanStack Query hoặc SWR để xử lý cache, chống trùng request, huỷ và retry, đồng thời tránh request waterfall.

## 4. Next.js

**1. How is Next.js different from React? / Next.js khác React ở điểm nào?**

EN: React is a UI library; with plain React you add routing, bundling, data fetching and SSR yourself. Next.js is a full-stack framework on top of React that provides file-based routing, multiple rendering strategies (SSR, SSG, ISR, CSR), Server Components, API/route handlers, middleware, image/font optimization and built-in tooling.

VI: React là thư viện UI; dùng React thuần bạn phải tự thêm routing, bundling, lấy dữ liệu và SSR. Next.js là framework full-stack xây trên React, cung cấp sẵn routing theo file, nhiều chiến lược render (SSR, SSG, ISR, CSR), Server Components, API/route handler, middleware, tối ưu ảnh/font và công cụ build.

**2. SSR vs CSR: pros and cons? / SSR và CSR: ưu nhược điểm?**

EN: SSR renders HTML on the server per request: better SEO and faster first paint, works without JS, but higher server load, higher TTFB, and still needs hydration before the page is interactive. CSR renders in the browser: smooth SPA-like navigation and lighter server, but a slower first load (large JS bundle) and weaker SEO.

VI: SSR render HTML trên server cho mỗi request: SEO tốt, hiển thị nội dung đầu tiên nhanh, chạy được khi tắt JS, nhưng tải server cao hơn, TTFB cao hơn, và vẫn cần hydration mới tương tác được. CSR render trên trình duyệt: điều hướng mượt như SPA và nhẹ server, nhưng tải lần đầu chậm (bundle JS lớn) và SEO yếu hơn.

**3. SSG vs SSR vs ISR: when to use which? / Khi nào dùng SSG, SSR, ISR?**

EN: SSG generates HTML at build time: fastest, for content that rarely changes (docs, blog). SSR generates per request: for personalized or constantly changing data. ISR serves a static page and regenerates it in the background after a `revalidate` interval or on demand: static speed with fresh-enough data (product pages, news).

VI: SSG tạo HTML lúc build: nhanh nhất, cho nội dung ít đổi (tài liệu, blog). SSR tạo theo từng request: cho dữ liệu cá nhân hoá hoặc thay đổi liên tục. ISR phục vụ trang tĩnh và tái tạo ngầm sau khoảng `revalidate` hoặc theo yêu cầu: vừa nhanh như tĩnh vừa đủ mới (trang sản phẩm, tin tức).

**4. `getStaticProps` vs `getStaticPaths` vs `getServerSideProps` (Pages Router)? / Phân biệt ba hàm này (Pages Router)?**

EN: `getStaticProps` runs at build time (and on revalidation) to produce props for a static page. `getStaticPaths` returns which dynamic routes (`[id]`) to pre-render, plus `fallback` behavior. `getServerSideProps` runs on the server for every request. None of them run in the browser.

VI: `getStaticProps` chạy lúc build (và khi revalidate) để tạo props cho trang tĩnh. `getStaticPaths` trả về các route động (`[id]`) cần sinh sẵn cùng cách xử lý `fallback`. `getServerSideProps` chạy trên server ở mỗi request. Cả ba đều không chạy ở trình duyệt.

**5. App Router vs Pages Router? / App Router khác Pages Router thế nào?**

EN: The App Router (`app/`) is built on React Server Components: components are server-by-default, data is fetched with `async/await` inside components, layouts nest and persist, and it supports streaming with `Suspense`, `loading.tsx`/`error.tsx`, route handlers and Server Actions. The Pages Router (`pages/`) uses `getStaticProps`/`getServerSideProps` and is still supported but legacy for new work.

VI: App Router (`app/`) xây trên React Server Components: component mặc định chạy trên server, lấy dữ liệu bằng `async/await` ngay trong component, layout lồng nhau và được giữ nguyên, hỗ trợ streaming với `Suspense`, `loading.tsx`/`error.tsx`, route handler và Server Actions. Pages Router (`pages/`) dùng `getStaticProps`/`getServerSideProps`, vẫn được hỗ trợ nhưng là hướng cũ cho dự án mới.

**6. Server Components vs Client Components? / Server Component và Client Component?**

EN: Server Components run only on the server, can access databases and secrets, and ship no JS to the client. Client Components (`'use client'`) hydrate in the browser and are needed for state, effects, event handlers and browser APIs. Push `'use client'` as far down the tree as possible to keep bundles small.

VI: Server Component chỉ chạy trên server, truy cập được database và secret, không gửi JS xuống client. Client Component (`'use client'`) được hydrate ở trình duyệt, cần cho state, effect, event handler và API trình duyệt. Nên đẩy `'use client'` xuống sâu nhất có thể trong cây để giữ bundle nhỏ.

**7. What is hydration and what causes hydration errors? / Hydration là gì và vì sao gây lỗi hydration?**

EN: Hydration attaches React's event handlers and state to server-rendered HTML in the browser. A mismatch error appears when server and client output differ, typically due to `Date.now()`, `Math.random()`, `window`/`localStorage` checks during render, browser extensions, or invalid HTML nesting. Fix by moving such logic into `useEffect` or marking it client-only.

VI: Hydration là bước React gắn event handler và state vào HTML đã render từ server ở trình duyệt. Lỗi mismatch xảy ra khi kết quả server và client khác nhau, thường do `Date.now()`, `Math.random()`, kiểm tra `window`/`localStorage` lúc render, extension trình duyệt hoặc HTML lồng sai. Cách sửa: đưa logic đó vào `useEffect` hoặc đánh dấu chỉ chạy ở client.

**8. How does caching and revalidation work in Next.js? / Caching và revalidation trong Next.js hoạt động ra sao?**

EN: Next.js can cache fetched data, rendered output and routes, and refresh them by time (`revalidate`) or on demand (`revalidatePath`, `revalidateTag`). The caching defaults have changed across major versions (14, 15, 16), so always check the documentation of the version you use rather than relying on memory.

VI: Next.js có thể cache dữ liệu fetch, kết quả render và route, rồi làm mới theo thời gian (`revalidate`) hoặc theo yêu cầu (`revalidatePath`, `revalidateTag`). Mặc định của cache đã thay đổi giữa các bản lớn (14, 15, 16), nên luôn đối chiếu tài liệu đúng phiên bản đang dùng thay vì dựa vào trí nhớ.

**9. What are Server Actions and Middleware? / Server Actions và Middleware là gì?**

EN: Server Actions (`'use server'`) are async functions that run on the server and can be called from forms or client code for mutations, without writing a separate API route. Middleware runs before a request completes (auth checks, redirects, rewrites, i18n, A/B tests); in Next.js 16 it is named `proxy`. Keep it lightweight.

VI: Server Actions (`'use server'`) là hàm async chạy trên server, gọi được từ form hoặc code client để thực hiện mutation mà không cần viết API route riêng. Middleware chạy trước khi request hoàn tất (kiểm tra auth, redirect, rewrite, i18n, A/B test); ở Next.js 16 nó có tên `proxy`. Nên giữ nhẹ.

**10. How do you improve performance and SEO in Next.js? / Cải thiện hiệu năng và SEO trong Next.js thế nào?**

EN: Prefer static/ISR where possible, use `next/image`, `next/font`, `next/link` prefetching, dynamic imports and Suspense streaming, keep Client Components small, and measure Core Web Vitals (LCP, INP, CLS). For SEO use the Metadata API, semantic HTML, `sitemap`/`robots`, canonical URLs and structured data.

VI: Ưu tiên static/ISR khi có thể, dùng `next/image`, `next/font`, prefetch của `next/link`, dynamic import và streaming bằng Suspense, giữ Client Component nhỏ, và đo Core Web Vitals (LCP, INP, CLS). Với SEO dùng Metadata API, HTML ngữ nghĩa, `sitemap`/`robots`, canonical URL và structured data.

**11. How do you handle environment variables and secrets? / Xử lý biến môi trường và secret thế nào?**

EN: Variables are server-only by default; only those prefixed with `NEXT_PUBLIC_` are inlined into the client bundle, so never put secrets there. Read secrets in Server Components, route handlers or Server Actions.

VI: Biến môi trường mặc định chỉ có ở server; chỉ biến có tiền tố `NEXT_PUBLIC_` được nhúng vào bundle client, nên không bao giờ để secret ở đó. Đọc secret trong Server Component, route handler hoặc Server Action.

## 5. HTML, CSS, Web & Performance

**1. What is the DOM? DOM vs BOM? / DOM là gì? DOM khác BOM thế nào?**

EN: The DOM (Document Object Model) is a tree representation of the HTML document where every element, text and attribute is a node that JavaScript can read and change. The BOM (Browser Object Model) covers browser-level objects outside the document: `window`, `location`, `history`, `navigator`, `localStorage`.

VI: DOM (Document Object Model) là biểu diễn dạng cây của tài liệu HTML, trong đó mỗi phần tử, văn bản, thuộc tính là một node mà JavaScript đọc và thay đổi được. BOM (Browser Object Model) gồm các đối tượng cấp trình duyệt nằm ngoài tài liệu: `window`, `location`, `history`, `navigator`, `localStorage`.

**2. How is CSS specificity calculated? / Độ ưu tiên (specificity) trong CSS tính thế nào?**

EN: From high to low: `!important`, inline style, ID selectors, class/attribute/pseudo-class selectors, element/pseudo-element selectors. With equal specificity the later rule wins. Avoid `!important` and deep selectors; prefer low-specificity, class-based CSS.

VI: Từ cao xuống thấp: `!important`, inline style, selector ID, selector class/attribute/pseudo-class, selector thẻ/pseudo-element. Cùng độ ưu tiên thì khai báo sau thắng. Tránh `!important` và selector sâu; ưu tiên CSS dựa trên class có specificity thấp.

**3. How do you build a responsive layout? / Làm responsive như thế nào?**

EN: Mobile-first CSS, `<meta name="viewport">`, relative units (`rem`, `%`, `vw`, `clamp()`), fluid grids with Flexbox/Grid, media queries (`min-width` breakpoints such as 768px and 992px) and container queries, plus responsive images (`srcset`, `sizes`, `loading="lazy"`).

VI: CSS theo hướng mobile-first, `<meta name="viewport">`, đơn vị tương đối (`rem`, `%`, `vw`, `clamp()`), lưới linh hoạt bằng Flexbox/Grid, media query (breakpoint `min-width` như 768px, 992px) và container query, cùng ảnh responsive (`srcset`, `sizes`, `loading="lazy"`).

**4. How does `position` work, and what is a stacking context? / `position` hoạt động thế nào, stacking context là gì?**

EN: `static` (default), `relative` (offset from its normal place), `absolute` (relative to the nearest positioned ancestor), `fixed` (relative to the viewport), `sticky` (relative until a scroll threshold, then fixed). `z-index` only works within a **stacking context** (created by `position` with z-index, `opacity < 1`, `transform`, etc.), so a high z-index cannot escape its parent context.

VI: `static` (mặc định), `relative` (lệch so với vị trí gốc), `absolute` (theo tổ tiên có position gần nhất), `fixed` (theo viewport), `sticky` (như relative đến ngưỡng cuộn rồi thành fixed). `z-index` chỉ có tác dụng trong cùng một **stacking context** (tạo bởi `position` kèm z-index, `opacity < 1`, `transform`...), nên z-index lớn cũng không thoát khỏi context của phần tử cha.

**5. `defer` vs `async` on script tags? / `defer` và `async` trên thẻ script khác nhau thế nào?**

EN: Both download in parallel without blocking HTML parsing. `async` executes as soon as it is downloaded (order not guaranteed). `defer` executes after the document is parsed, in order. Use `defer` for scripts that depend on the DOM or on each other.

VI: Cả hai tải song song, không chặn việc parse HTML. `async` chạy ngay khi tải xong (không đảm bảo thứ tự). `defer` chạy sau khi parse xong tài liệu, theo đúng thứ tự. Dùng `defer` cho script phụ thuộc DOM hoặc phụ thuộc lẫn nhau.

**6. What happens when you type a URL and press Enter? / Chuyện gì xảy ra khi gõ URL và nhấn Enter?**

EN: DNS lookup, TCP connection and TLS handshake, HTTP request, server response, the browser parses HTML into the DOM and CSS into the CSSOM, builds the render tree, then layout, paint and composite; JavaScript can block parsing unless it is `defer`/`async`.

VI: Phân giải DNS, kết nối TCP và bắt tay TLS, gửi HTTP request, server phản hồi, trình duyệt parse HTML thành DOM và CSS thành CSSOM, dựng render tree, rồi layout, paint, composite; JavaScript có thể chặn parse trừ khi dùng `defer`/`async`.

**7. What are Core Web Vitals and how do you improve them? / Core Web Vitals là gì và cải thiện thế nào?**

EN: **LCP** (loading speed of the main content), **INP** (responsiveness to interactions; it replaced FID), **CLS** (visual stability). Improve with optimized images and preloading the hero asset (LCP), less main-thread JS and splitting long tasks (INP), and reserving space with `width`/`height` and stable fonts (CLS).

VI: **LCP** (tốc độ hiển thị nội dung chính), **INP** (độ phản hồi khi tương tác, thay thế FID), **CLS** (độ ổn định hình ảnh). Cải thiện bằng ảnh tối ưu và preload tài nguyên chính (LCP), giảm JS trên main thread và tách tác vụ dài (INP), giữ chỗ bằng `width`/`height` và font ổn định (CLS).

**8. How do you optimize front-end performance in general? / Tối ưu hiệu năng front-end nói chung?**

EN: Code splitting and lazy loading, tree shaking and minification, gzip/brotli compression, CDN, HTTP caching and service workers, image optimization (WebP/AVIF), `preload`/`prefetch`, reducing third-party scripts, avoiding layout thrashing, and measuring with Lighthouse and DevTools.

VI: Code splitting và lazy loading, tree shaking và minify, nén gzip/brotli, CDN, HTTP cache và service worker, tối ưu ảnh (WebP/AVIF), `preload`/`prefetch`, giảm script bên thứ ba, tránh layout thrashing, và đo bằng Lighthouse và DevTools.

**9. `localStorage` vs `sessionStorage` vs cookie vs IndexedDB? / So sánh các cơ chế lưu trữ ở trình duyệt?**

EN: `localStorage`: persistent, \~5MB, not sent to the server. `sessionStorage`: per tab, cleared when the tab closes. Cookie: \~4KB, sent with every request, supports `HttpOnly`/`Secure`/`SameSite`. IndexedDB: large structured data, asynchronous.

VI: `localStorage`: lưu bền, \~5MB, không gửi lên server. `sessionStorage`: theo tab, mất khi đóng tab. Cookie: \~4KB, gửi kèm mọi request, hỗ trợ `HttpOnly`/`Secure`/`SameSite`. IndexedDB: dữ liệu có cấu trúc lớn, bất đồng bộ.

**10. What are XSS, CSRF and CORS, and how do you handle them? / XSS, CSRF, CORS là gì và xử lý thế nào?**

EN: XSS injects malicious script: escape output (React escapes by default; beware `dangerouslySetInnerHTML`) and add a CSP. CSRF abuses the browser's automatic cookies: use `SameSite` cookies and CSRF tokens. CORS is a browser rule that blocks cross-origin requests unless the **server** allows them via headers; it is configured on the server, not fixed in client code.

VI: XSS chèn script độc: escape output (React mặc định đã escape; cẩn thận `dangerouslySetInnerHTML`) và thêm CSP. CSRF lợi dụng việc trình duyệt tự gửi cookie: dùng cookie `SameSite` và CSRF token. CORS là quy tắc của trình duyệt chặn request khác origin trừ khi **server** cho phép qua header; cấu hình ở server, không sửa được từ code client.

**11. Where should you store an auth token? / Nên lưu token đăng nhập ở đâu?**

EN: Prefer an `HttpOnly`, `Secure`, `SameSite` cookie so JavaScript cannot read it, which limits damage from XSS. `localStorage` is readable by any script on the page, so avoid it for sensitive tokens. Each choice has trade-offs (CSRF vs XSS), so state them.

VI: Ưu tiên cookie `HttpOnly`, `Secure`, `SameSite` để JavaScript không đọc được, hạn chế thiệt hại từ XSS. `localStorage` bị mọi script trên trang đọc được nên tránh dùng cho token nhạy cảm. Mỗi lựa chọn đều có đánh đổi (CSRF so với XSS), nên hãy nêu rõ khi trả lời.

**12. How do you make a page accessible (a11y)? / Làm trang web accessible (a11y) thế nào?**

EN: Use semantic HTML, `alt` text, labels for inputs, sufficient color contrast, visible focus states, full keyboard navigation, and ARIA only when native elements are not enough. Test with a screen reader and tools such as axe or Lighthouse.

VI: Dùng HTML ngữ nghĩa, `alt` cho ảnh, label cho input, độ tương phản màu đủ, trạng thái focus nhìn thấy được, điều hướng hoàn toàn bằng bàn phím, và chỉ dùng ARIA khi phần tử gốc chưa đủ. Kiểm tra bằng screen reader và công cụ như axe hoặc Lighthouse.

## 6. Senior: Architecture, System Design & Leadership

**1. How do you approach a frontend system design question? / Tiếp cận câu hỏi frontend system design thế nào?**

EN: Use a structure such as RADIO: **R**equirements (functional, non-functional, scale, devices), **A**rchitecture (components, rendering strategy, state ownership), **D**ata model (client entities, normalization, cache), **I**nterface (API shape, pagination, real-time), **O**ptimizations (performance, a11y, i18n, security, offline). Clarify scope first, state trade-offs explicitly, and go deep on one or two areas rather than listing everything.

VI: Dùng khung như RADIO: **R**equirements (chức năng, phi chức năng, quy mô, thiết bị), **A**rchitecture (component, chiến lược render, nơi giữ state), **D**ata model (entity phía client, chuẩn hoá, cache), **I**nterface (dạng API, phân trang, real-time), **O**ptimizations (hiệu năng, a11y, i18n, bảo mật, offline). Làm rõ phạm vi trước, nêu rõ đánh đổi, và đào sâu một hai phần thay vì liệt kê mọi thứ.

**2. Design an autocomplete (typeahead) component. / Thiết kế component autocomplete.**

EN: Debounce input (\~200–300ms), cancel stale requests (`AbortController`) or ignore out-of-order responses, cache results per query (in-memory LRU), set a minimum query length, and handle loading/empty/error states. For UX and a11y: keyboard navigation (arrow keys, Enter, Esc), the ARIA combobox pattern, highlight matches, and virtualize long result lists.

VI: Debounce input (\~200–300ms), huỷ request cũ (`AbortController`) hoặc bỏ qua response về sai thứ tự, cache kết quả theo từ khoá (LRU trong bộ nhớ), đặt độ dài tối thiểu, xử lý trạng thái loading/rỗng/lỗi. Về UX và a11y: điều hướng bàn phím (mũi tên, Enter, Esc), pattern ARIA combobox, tô sáng phần khớp, và virtualize khi danh sách dài.

**3. Design an infinite-scroll news feed. / Thiết kế news feed cuộn vô hạn.**

EN: Cursor-based pagination (stable when new items arrive), `IntersectionObserver` to load the next page, list virtualization to keep the DOM small, normalized cache of posts, optimistic updates for likes/comments, image lazy loading with reserved dimensions (no CLS), and a "new posts" banner instead of shifting content. Preserve scroll position when navigating back.

VI: Phân trang theo cursor (ổn định khi có bài mới), `IntersectionObserver` để tải trang tiếp, virtualize danh sách để DOM nhỏ, cache bài viết đã chuẩn hoá, optimistic update cho like/comment, lazy load ảnh kèm kích thước giữ chỗ (tránh CLS), và hiển thị banner "có bài mới" thay vì đẩy nội dung. Giữ vị trí cuộn khi quay lại trang.

**4. How do you structure a large frontend codebase? / Tổ chức codebase frontend lớn thế nào?**

EN: Organize by feature/domain rather than by file type, with clear public APIs per module and enforced boundaries (lint rules, path aliases). Separate shared UI (design system), shared utilities, and feature code. Keep data fetching and business logic out of presentational components. A monorepo (Nx, Turborepo, pnpm workspaces) helps share code and run affected-only builds and tests.

VI: Chia theo tính năng/domain thay vì theo loại file, mỗi module có public API rõ ràng và ranh giới được kiểm soát (lint rule, path alias). Tách UI dùng chung (design system), tiện ích dùng chung và code tính năng. Đưa logic lấy dữ liệu và nghiệp vụ ra khỏi component hiển thị. Monorepo (Nx, Turborepo, pnpm workspaces) giúp chia sẻ code và chỉ build/test phần bị ảnh hưởng.

**5. Micro-frontends: when would you use them and what are the trade-offs? / Micro-frontend: khi nào dùng và đánh đổi gì?**

EN: Useful when many independent teams must deploy parts of a large product separately (Module Federation, iframes, or build-time composition). Costs: duplicated dependencies and larger bundles, inconsistent UX, shared state and routing complexity, harder testing and versioning. For most companies a well-structured monorepo is enough; adopt micro-frontends for organizational scaling, not for technology fashion.

VI: Hữu ích khi nhiều team độc lập cần deploy riêng từng phần của một sản phẩm lớn (Module Federation, iframe, hoặc ghép lúc build). Chi phí: trùng dependency và bundle lớn hơn, UX thiếu nhất quán, phức tạp về state và routing chung, khó test và quản lý version. Với đa số công ty, một monorepo tổ chức tốt là đủ; chỉ dùng micro-frontend để mở rộng tổ chức, không phải vì xu hướng công nghệ.

**6. Webpack vs Vite? How do tree shaking and code splitting work? / Webpack và Vite khác nhau thế nào? Tree shaking và code splitting hoạt động ra sao?**

EN: Vite serves native ES modules in development (near-instant startup, fast HMR) and bundles with Rollup for production; Webpack bundles everything even in development but is highly configurable and mature. Tree shaking removes unused exports and relies on static ESM imports and side-effect-free modules (`sideEffects` in package.json). Code splitting creates chunks at dynamic `import()` points (routes, heavy widgets). Inspect results with a bundle analyzer.

VI: Vite phục vụ ES module gốc khi dev (khởi động gần như tức thì, HMR nhanh) và dùng Rollup để bundle production; Webpack bundle toàn bộ kể cả khi dev nhưng cấu hình rất linh hoạt và trưởng thành. Tree shaking loại bỏ export không dùng, dựa vào import ESM tĩnh và module không có side effect (`sideEffects` trong package.json). Code splitting tạo chunk tại các điểm `import()` động (route, widget nặng). Kiểm tra kết quả bằng bundle analyzer.

**7. What is your testing strategy for a large app? / Chiến lược test cho một ứng dụng lớn?**

EN: Follow the testing trophy: static checks (TypeScript, ESLint), many integration tests with React Testing Library and mocked network (MSW), unit tests for pure logic, and a small set of E2E tests (Playwright) for critical flows like login and checkout. Add visual regression for the design system, run tests in CI on every PR, and focus on behavior rather than implementation details.

VI: Theo mô hình testing trophy: kiểm tra tĩnh (TypeScript, ESLint), nhiều integration test với React Testing Library và mock network (MSW), unit test cho logic thuần, và một nhóm nhỏ E2E (Playwright) cho luồng quan trọng như đăng nhập, thanh toán. Thêm visual regression cho design system, chạy test trên CI ở mọi PR, và tập trung vào hành vi thay vì chi tiết cài đặt.

**8. Polling vs Server-Sent Events vs WebSocket? / So sánh polling, SSE và WebSocket?**

EN: Polling is simplest but wasteful and delayed. SSE is a one-way server-to-client stream over HTTP with automatic reconnect, good for notifications and live feeds. WebSocket is full-duplex, suited to chat, collaboration and games, but needs connection management, reconnect with backoff, heartbeats, and scaling support on the server.

VI: Polling đơn giản nhất nhưng lãng phí và có độ trễ. SSE là luồng một chiều từ server xuống client qua HTTP, tự kết nối lại, hợp với thông báo và live feed. WebSocket là hai chiều, hợp với chat, cộng tác, game, nhưng cần quản lý kết nối, reconnect có backoff, heartbeat và hạ tầng server hỗ trợ mở rộng.

**9. How do you monitor a frontend in production? / Giám sát frontend trên production thế nào?**

EN: Error tracking with source maps (e.g. Sentry), Real User Monitoring of Core Web Vitals, structured logging for key user actions, and alerts on error-rate or performance regressions. Ship safely with feature flags, gradual rollouts, and fast rollback.

VI: Theo dõi lỗi kèm source map (ví dụ Sentry), Real User Monitoring cho Core Web Vitals, log có cấu trúc cho các hành động quan trọng, và cảnh báo khi tỉ lệ lỗi hoặc hiệu năng giảm. Phát hành an toàn bằng feature flag, rollout từng phần và rollback nhanh.

**10. How would you build and maintain a design system? / Xây dựng và duy trì design system thế nào?**

EN: Start from design tokens (color, spacing, typography) shared with designers, build accessible headless or styled primitives, document them in Storybook, and publish as a versioned package with semantic versioning and changelogs. Add visual regression tests, define contribution rules, and plan migrations for breaking changes (codemods, deprecation warnings).

VI: Bắt đầu từ design token (màu, khoảng cách, typography) dùng chung với designer, xây các component nền tảng có accessibility (headless hoặc đã style), viết tài liệu trên Storybook, và phát hành thành package có version theo semantic versioning kèm changelog. Thêm visual regression test, đặt quy tắc đóng góp, và có kế hoạch migrate khi có breaking change (codemod, cảnh báo deprecated).

**11. A page became slow in production. How do you investigate? / Một trang đột nhiên chậm trên production, bạn điều tra thế nào?**

EN: Confirm and scope with RUM data (which metric, pages, devices, since which release). Reproduce with throttled CPU/network, then profile: Lighthouse, the Performance panel (long tasks, layout shifts), React Profiler (unnecessary renders), and a bundle analyzer (size regressions). Compare against the previous release, fix the root cause, and add a performance budget in CI to prevent recurrence.

VI: Xác nhận và khoanh vùng bằng dữ liệu RUM (chỉ số nào, trang nào, thiết bị nào, từ bản release nào). Tái hiện với CPU/network bị giới hạn, rồi profile: Lighthouse, tab Performance (long task, layout shift), React Profiler (render thừa), và bundle analyzer (bundle tăng kích thước). So sánh với bản release trước, sửa nguyên nhân gốc, và thêm performance budget vào CI để tránh lặp lại.

**12. Tell me about a technical decision you disagreed with, or how you mentor others. / Kể về một quyết định kỹ thuật bạn không đồng ý, hoặc cách bạn hướng dẫn người khác.**

EN: Answer with STAR (Situation, Task, Action, Result). Show that you argue with data (benchmarks, prototypes, an RFC), listen and commit once a decision is made, and measure the outcome. For mentoring, show concrete practices: thoughtful code reviews that explain why, pairing, writing guidelines, and gradually giving ownership.

VI: Trả lời theo STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả). Cho thấy bạn tranh luận bằng dữ liệu (benchmark, prototype, RFC), biết lắng nghe và cam kết khi đã có quyết định, và đo lường kết quả. Với mentoring, nêu cách làm cụ thể: review code có giải thích lý do, pair programming, viết guideline, và giao dần quyền sở hữu.

## 7. Performance (Deep Dive)

**1. Reflow vs repaint vs composite? What is layout thrashing? / Reflow, repaint, composite khác nhau thế nào? Layout thrashing là gì?**

EN: Reflow (layout) recalculates sizes and positions and is the most expensive step. Repaint redraws pixels (e.g. a color change). Composite only moves existing layers on the GPU and is cheapest. Layout thrashing happens when code alternates DOM reads (`offsetHeight`) and writes in a loop, forcing synchronous layout each time. Batch reads before writes, use `requestAnimationFrame`, and animate only `transform` and `opacity`.

VI: Reflow (layout) tính lại kích thước và vị trí, tốn kém nhất. Repaint vẽ lại pixel (ví dụ đổi màu). Composite chỉ di chuyển các layer có sẵn trên GPU, rẻ nhất. Layout thrashing xảy ra khi code xen kẽ đọc DOM (`offsetHeight`) và ghi DOM trong vòng lặp, buộc trình duyệt tính layout đồng bộ liên tục. Gom đọc trước rồi ghi sau, dùng `requestAnimationFrame`, và chỉ animate `transform`, `opacity`.

**2. How does HTTP caching work for front-end assets? / HTTP caching cho tài nguyên front-end hoạt động thế nào?**

EN: Hashed static files (`app.3f2a1.js`) get `Cache-Control: public, max-age=31536000, immutable` because a new build changes the filename. HTML gets `no-cache` (always revalidate) so users pick up new asset URLs. `ETag`/`Last-Modified` enable `304 Not Modified` revalidation, and `stale-while-revalidate` serves cached content while refreshing in the background.

VI: File tĩnh có hash (`app.3f2a1.js`) dùng `Cache-Control: public, max-age=31536000, immutable` vì build mới sẽ đổi tên file. HTML dùng `no-cache` (luôn kiểm tra lại) để người dùng nhận URL tài nguyên mới. `ETag`/`Last-Modified` cho phép revalidate trả về `304 Not Modified`, còn `stale-while-revalidate` trả bản cache trong lúc làm mới ngầm.

**3. `preload` vs `prefetch` vs `preconnect`? / Khác nhau giữa `preload`, `prefetch`, `preconnect`?**

EN: `preload` fetches a resource needed for the current page with high priority (LCP image, critical font). `prefetch` fetches a resource likely needed for the next navigation with low priority. `preconnect` opens the DNS/TCP/TLS connection to an origin early (CDN, API); `dns-prefetch` does only the DNS step. Overusing `preload` competes with critical resources.

VI: `preload` tải tài nguyên cần cho trang hiện tại với độ ưu tiên cao (ảnh LCP, font quan trọng). `prefetch` tải tài nguyên có thể cần cho trang kế tiếp với độ ưu tiên thấp. `preconnect` mở sẵn kết nối DNS/TCP/TLS tới một origin (CDN, API); `dns-prefetch` chỉ làm bước DNS. Lạm dụng `preload` sẽ tranh băng thông với tài nguyên quan trọng.

**4. How do you optimize images? / Tối ưu ảnh như thế nào?**

EN: Use modern formats (AVIF, WebP), serve responsive sizes with `srcset`/`sizes`, compress and resize through an image CDN, lazy-load below-the-fold images, and set `width`/`height` or `aspect-ratio` to avoid CLS. Never lazy-load the LCP image; give it `fetchpriority="high"` instead.

VI: Dùng định dạng hiện đại (AVIF, WebP), trả kích thước phù hợp bằng `srcset`/`sizes`, nén và resize qua image CDN, lazy-load ảnh dưới màn hình đầu, và đặt `width`/`height` hoặc `aspect-ratio` để tránh CLS. Không lazy-load ảnh LCP; thay vào đó đặt `fetchpriority="high"`.

**5. How do you reduce JavaScript bundle size? / Giảm kích thước bundle JavaScript thế nào?**

EN: Measure with a bundle analyzer, split by route and lazy-load heavy components with dynamic `import()`, replace heavy libraries (e.g. moment → date-fns or `Intl`), import only what you use, avoid large barrel files that defeat tree shaking, ship modern syntax without unnecessary polyfills, and keep logic in Server Components where possible. Enforce a size budget in CI.

VI: Đo bằng bundle analyzer, tách theo route và lazy-load component nặng bằng `import()` động, thay thư viện nặng (ví dụ moment → date-fns hoặc `Intl`), chỉ import phần cần dùng, tránh barrel file lớn làm hỏng tree shaking, build cú pháp hiện đại không kèm polyfill thừa, và giữ logic ở Server Component khi có thể. Đặt ngân sách kích thước trong CI.

**6. How do you render a list of 10,000 items smoothly? / Hiển thị mượt danh sách 10.000 phần tử thế nào?**

EN: Virtualize (react-window, TanStack Virtual) so only visible rows are in the DOM, or paginate/infinite-load. Keep row components memoized with stable `key`s, avoid expensive work per row, and consider CSS `content-visibility: auto` for long static content.

VI: Virtualize (react-window, TanStack Virtual) để chỉ các dòng đang hiển thị nằm trong DOM, hoặc phân trang/tải vô hạn. Memo hoá component của mỗi dòng với `key` ổn định, tránh xử lý nặng trên từng dòng, và cân nhắc CSS `content-visibility: auto` cho nội dung tĩnh dài.

**7. What changed with HTTP/2 and HTTP/3 for front-end optimization? / HTTP/2 và HTTP/3 thay đổi gì với việc tối ưu front-end?**

EN: HTTP/2 multiplexes many requests over one connection and compresses headers, so old tricks like domain sharding and aggressive file concatenation matter less; many small cacheable chunks are fine. HTTP/3 runs over QUIC (UDP), removing TCP head-of-line blocking and speeding up connections on unreliable mobile networks.

VI: HTTP/2 ghép nhiều request trên một kết nối và nén header, nên các mẹo cũ như domain sharding hay gộp file triệt để không còn quan trọng; chia nhiều chunk nhỏ dễ cache là hợp lý. HTTP/3 chạy trên QUIC (UDP), loại bỏ head-of-line blocking của TCP và kết nối nhanh hơn trên mạng di động không ổn định.

**8. How do you optimize web fonts? / Tối ưu web font thế nào?**

EN: Self-host or preload critical fonts, use WOFF2, subset to the characters you need (watch Vietnamese diacritics), use `font-display: swap` or `optional`, and match fallback metrics (`size-adjust`) to reduce layout shift. Frameworks like `next/font` automate most of this.

VI: Tự host hoặc preload font quan trọng, dùng WOFF2, subset chỉ các ký tự cần (lưu ý dấu tiếng Việt), dùng `font-display: swap` hoặc `optional`, và chỉnh thông số font dự phòng (`size-adjust`) để giảm layout shift. Framework như `next/font` tự động hoá phần lớn việc này.

**9. When would you use a Web Worker? / Khi nào dùng Web Worker?**

EN: For CPU-heavy work that would block the main thread: parsing large files, image processing, encryption, complex filtering or search over big datasets. Workers have no DOM access and communicate via `postMessage` (transferable objects avoid copying). Libraries like Comlink make the API feel like normal async calls.

VI: Cho công việc nặng CPU có thể chặn main thread: parse file lớn, xử lý ảnh, mã hoá, lọc hoặc tìm kiếm phức tạp trên dữ liệu lớn. Worker không truy cập được DOM và giao tiếp qua `postMessage` (transferable object giúp tránh sao chép). Thư viện như Comlink giúp gọi worker như hàm async thông thường.

## 8. Security (Deep Dive)

Khái niệm cơ bản về XSS, CSRF, CORS và lưu token nằm ở mục 5 (câu 10, 11); mục này đi sâu hơn.

**1. What are the types of XSS and how do you defend in depth? / Có những loại XSS nào, phòng thủ nhiều lớp thế nào?**

EN: **Stored** (malicious script saved in the DB and shown to other users), **reflected** (script in a URL/request echoed back by the server), and **DOM-based** (client code writes untrusted input into the DOM, e.g. `innerHTML`, `location.hash`). Defense in depth: contextual output encoding, no raw HTML injection (or sanitize it), validate URLs (block `javascript:`), a strict CSP, and `HttpOnly` cookies so a successful XSS cannot steal sessions.

VI: **Stored** (script độc lưu trong DB rồi hiển thị cho người khác), **reflected** (script nằm trong URL/request và bị server trả ngược lại), và **DOM-based** (code client ghi dữ liệu không tin cậy vào DOM, ví dụ `innerHTML`, `location.hash`). Phòng thủ nhiều lớp: encode output theo ngữ cảnh, không chèn HTML thô (hoặc phải sanitize), kiểm tra URL (chặn `javascript:`), CSP chặt chẽ, và cookie `HttpOnly` để dù bị XSS cũng không lấy được session.

**2. How do you safely render user-generated HTML? / Hiển thị HTML do người dùng nhập một cách an toàn thế nào?**

EN: Prefer rendering text, not HTML; React escapes text by default. If HTML is required (rich text, Markdown output), sanitize it with an allow-list library such as DOMPurify before using `dangerouslySetInnerHTML`, and sanitize on the server too. Also check `href`/`src` values, because React does not block every dangerous URL scheme.

VI: Ưu tiên hiển thị dạng text thay vì HTML; React mặc định đã escape text. Nếu bắt buộc phải có HTML (rich text, kết quả Markdown), sanitize bằng thư viện allow-list như DOMPurify trước khi dùng `dangerouslySetInnerHTML`, và sanitize cả ở server. Kiểm tra thêm giá trị `href`/`src`, vì React không chặn mọi scheme URL nguy hiểm.

**3. What is Content Security Policy (CSP)? / Content Security Policy (CSP) là gì?**

EN: An HTTP header telling the browser which sources may load scripts, styles, images, frames and connections, e.g. `script-src 'self' 'nonce-abc123'`. It blocks injected inline scripts and untrusted domains, limiting the impact of XSS. Prefer nonces or hashes over `'unsafe-inline'`, roll out with `Content-Security-Policy-Report-Only` first, and collect violation reports.

VI: Là HTTP header cho trình duyệt biết nguồn nào được phép tải script, style, ảnh, frame và kết nối, ví dụ `script-src 'self' 'nonce-abc123'`. Nó chặn script inline bị chèn và domain không tin cậy, giảm thiệt hại khi bị XSS. Ưu tiên nonce hoặc hash thay vì `'unsafe-inline'`, triển khai thử với `Content-Security-Policy-Report-Only` trước và thu thập báo cáo vi phạm.

**4. Explain CORS in detail: simple vs preflight requests and credentials. / Giải thích chi tiết CORS: simple request, preflight và credentials.**

EN: Browsers block reading cross-origin responses unless the server returns `Access-Control-Allow-Origin`. "Simple" requests (GET/POST with basic headers and content types) are sent directly. Others (PUT/DELETE, `Content-Type: application/json`, custom headers) first send an `OPTIONS` **preflight**; the server must answer with allowed methods/headers (cacheable via `Access-Control-Max-Age`). To send cookies, the client sets `credentials: 'include'` and the server must return a specific origin (not `*`) plus `Access-Control-Allow-Credentials: true`. CORS protects users' browsers; it is not server-side authorization.

VI: Trình duyệt chặn đọc response khác origin trừ khi server trả về `Access-Control-Allow-Origin`. Request "simple" (GET/POST với header và content type cơ bản) được gửi thẳng. Các request khác (PUT/DELETE, `Content-Type: application/json`, header tuỳ chỉnh) sẽ gửi **preflight** `OPTIONS` trước; server phải trả về method/header được phép (có thể cache bằng `Access-Control-Max-Age`). Muốn gửi cookie, client đặt `credentials: 'include'` và server phải trả về origin cụ thể (không phải `*`) kèm `Access-Control-Allow-Credentials: true`. CORS bảo vệ trình duyệt người dùng, không thay thế được phân quyền phía server.

**5. What is clickjacking and how do you prevent it? / Clickjacking là gì và chống thế nào?**

EN: An attacker loads your site in an invisible iframe and tricks users into clicking buttons on it. Prevent framing with the CSP directive `frame-ancestors 'none'` (or a list of trusted origins), and `X-Frame-Options: DENY` for older browsers.

VI: Kẻ tấn công nhúng trang của bạn vào iframe vô hình và lừa người dùng bấm vào các nút trên đó. Chặn việc bị nhúng bằng chỉ thị CSP `frame-ancestors 'none'` (hoặc danh sách origin tin cậy), và `X-Frame-Options: DENY` cho trình duyệt cũ.

**6. Session cookies vs JWT: which would you choose? / Session cookie hay JWT, bạn chọn cái nào?**

EN: Server sessions (an ID in an `HttpOnly` cookie, data on the server) are simple and easy to revoke. JWTs are self-contained and stateless, which suits distributed services, but are hard to revoke before expiry and become large. A common secure pattern: a short-lived access token kept in memory, plus a refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie with rotation and reuse detection. Never put secrets in a JWT payload; it is only encoded, not encrypted.

VI: Session phía server (ID nằm trong cookie `HttpOnly`, dữ liệu ở server) đơn giản và dễ thu hồi. JWT tự chứa thông tin và stateless, hợp với hệ thống phân tán, nhưng khó thu hồi trước khi hết hạn và kích thước lớn. Mô hình an toàn phổ biến: access token ngắn hạn giữ trong bộ nhớ, refresh token nằm trong cookie `HttpOnly`, `Secure`, `SameSite`, có xoay vòng (rotation) và phát hiện tái sử dụng. Không bao giờ để thông tin bí mật trong payload JWT vì nó chỉ được encode, không mã hoá.

**7. How should a SPA implement OAuth 2.0 / social login? / SPA nên triển khai OAuth 2.0 / đăng nhập mạng xã hội thế nào?**

EN: Use the Authorization Code flow with **PKCE** (the Implicit flow is deprecated). Use the `state` parameter against CSRF and validate redirect URIs. Better still, use a Backend-for-Frontend (BFF): the server completes the token exchange and the browser only holds an `HttpOnly` session cookie, so tokens never touch JavaScript.

VI: Dùng Authorization Code flow kèm **PKCE** (Implicit flow đã bị khuyến nghị bỏ). Dùng tham số `state` để chống CSRF và kiểm tra redirect URI. Tốt hơn nữa là mô hình Backend-for-Frontend (BFF): server thực hiện đổi token, trình duyệt chỉ giữ cookie session `HttpOnly`, nên token không bao giờ lộ ra JavaScript.

**8. Which security headers should a web app send? / Ứng dụng web nên gửi những security header nào?**

EN: `Strict-Transport-Security` (force HTTPS), `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disable camera, geolocation... if unused), and `frame-ancestors` / `X-Frame-Options`. Check them with a header scanner in CI.

VI: `Strict-Transport-Security` (bắt buộc HTTPS), `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (tắt camera, định vị... nếu không dùng), và `frame-ancestors` / `X-Frame-Options`. Kiểm tra bằng công cụ quét header trong CI.

**9. How do you protect against supply-chain attacks in npm dependencies? / Phòng chống tấn công chuỗi cung ứng qua dependency npm thế nào?**

EN: Commit lockfiles and install with `npm ci`, run `npm audit` plus Dependabot/Renovate, review new or rarely maintained packages before adding them, limit install scripts, pin versions, and use Subresource Integrity (`integrity` attribute) for scripts loaded from CDNs. Fewer dependencies means a smaller attack surface.

VI: Commit lockfile và cài bằng `npm ci`, chạy `npm audit` cùng Dependabot/Renovate, xem xét kỹ package mới hoặc ít được bảo trì trước khi thêm, hạn chế install script, ghim version, và dùng Subresource Integrity (thuộc tính `integrity`) cho script tải từ CDN. Càng ít dependency, bề mặt tấn công càng nhỏ.

## 9. Database Basics

**1. SQL vs NoSQL: when do you use which? / SQL và NoSQL: khi nào dùng loại nào?**

EN: SQL databases (PostgreSQL, MySQL) use tables with a fixed schema, relations via JOINs and strong ACID transactions; good for structured, relational data such as orders and payments. NoSQL covers document (MongoDB), key-value (Redis), wide-column (Cassandra) and graph (Neo4j) stores, with flexible schemas and easier horizontal scaling, often trading some consistency. Choose by data shape, query patterns and consistency needs, not by trend.

VI: CSDL SQL (PostgreSQL, MySQL) dùng bảng có schema cố định, quan hệ qua JOIN và transaction ACID chặt chẽ; hợp với dữ liệu có cấu trúc, nhiều quan hệ như đơn hàng, thanh toán. NoSQL gồm document (MongoDB), key-value (Redis), wide-column (Cassandra) và graph (Neo4j), schema linh hoạt và dễ mở rộng ngang, thường đánh đổi một phần tính nhất quán. Chọn theo hình dạng dữ liệu, kiểu truy vấn và yêu cầu nhất quán, không theo xu hướng.

**2. Primary key, foreign key and index: what are they? / Primary key, foreign key và index là gì?**

EN: A primary key uniquely identifies a row. A foreign key references another table's primary key and enforces referential integrity. An index (usually a B-tree) is a sorted lookup structure that speeds up `WHERE`, `JOIN` and `ORDER BY` from a full scan to roughly logarithmic time, at the cost of extra storage and slower writes. Index columns you filter or join on often; composite indexes follow the leftmost-prefix rule.

VI: Primary key định danh duy nhất một dòng. Foreign key tham chiếu tới primary key của bảng khác và đảm bảo toàn vẹn tham chiếu. Index (thường là B-tree) là cấu trúc tra cứu đã sắp xếp, giúp `WHERE`, `JOIN`, `ORDER BY` nhanh hơn từ quét toàn bảng xuống khoảng thời gian logarit, đổi lại tốn thêm dung lượng và ghi chậm hơn. Đánh index cho cột hay lọc hoặc join; index nhiều cột tuân theo quy tắc tiền tố bên trái (leftmost prefix).

**3. What is ACID? / ACID là gì?**

EN: **Atomicity** (all or nothing), **Consistency** (constraints always hold), **Isolation** (concurrent transactions don't interfere), **Durability** (committed data survives crashes). Classic example: a bank transfer must debit and credit together inside one transaction.

VI: **Atomicity** (tất cả hoặc không gì cả), **Consistency** (ràng buộc luôn được giữ), **Isolation** (các transaction đồng thời không ảnh hưởng nhau), **Durability** (dữ liệu đã commit không mất khi sự cố). Ví dụ kinh điển: chuyển tiền phải trừ và cộng tiền trong cùng một transaction.

**4. What are transaction isolation levels? / Các mức cô lập (isolation level) của transaction là gì?**

EN: From weakest to strongest: Read Uncommitted (allows dirty reads), Read Committed (prevents dirty reads; PostgreSQL's default), Repeatable Read (prevents non-repeatable reads; MySQL InnoDB's default), Serializable (prevents phantom reads, behaves as if transactions run one by one). Stronger isolation means fewer anomalies but more locking or retries.

VI: Từ yếu đến mạnh: Read Uncommitted (cho phép dirty read), Read Committed (chặn dirty read; mặc định của PostgreSQL), Repeatable Read (chặn non-repeatable read; mặc định của MySQL InnoDB), Serializable (chặn phantom read, như thể các transaction chạy lần lượt). Mức càng cao càng ít bất thường nhưng càng nhiều khoá hoặc phải retry.

**5. Explain the JOIN types. / Giải thích các loại JOIN.**

EN: `INNER JOIN` returns only matching rows from both tables. `LEFT JOIN` returns all rows from the left table plus matches (NULL when none); `RIGHT JOIN` is the mirror. `FULL OUTER JOIN` returns all rows from both. `CROSS JOIN` returns the Cartesian product.

VI: `INNER JOIN` chỉ trả các dòng khớp ở cả hai bảng. `LEFT JOIN` trả mọi dòng của bảng trái kèm dòng khớp (NULL nếu không có); `RIGHT JOIN` ngược lại. `FULL OUTER JOIN` trả mọi dòng của cả hai bảng. `CROSS JOIN` trả tích Descartes.

**6. Normalization vs denormalization? / Chuẩn hoá và phi chuẩn hoá?**

EN: Normalization (1NF, 2NF, 3NF) splits data into related tables to remove duplication and update anomalies. Denormalization deliberately duplicates data (e.g. storing `author_name` on posts, counters, read models) to make reads faster at the cost of keeping copies in sync. Typical approach: normalize first, denormalize measured hot paths.

VI: Chuẩn hoá (1NF, 2NF, 3NF) tách dữ liệu thành các bảng liên quan để bỏ trùng lặp và lỗi khi cập nhật. Phi chuẩn hoá cố ý lặp dữ liệu (ví dụ lưu `author_name` trong bài viết, bộ đếm, read model) để đọc nhanh hơn, đổi lại phải đồng bộ các bản sao. Cách làm thường gặp: chuẩn hoá trước, phi chuẩn hoá ở các điểm nóng đã đo đạc.

**7. What is the N+1 query problem? / Vấn đề N+1 query là gì?**

EN: Fetching a list with 1 query, then running 1 more query per item (e.g. the author of each of 50 posts = 51 queries). Fix with a JOIN, `WHERE id IN (...)` batching, ORM eager loading (`include`/`populate`), or DataLoader in GraphQL resolvers. The same pattern appears on the front end as request waterfalls.

VI: Lấy danh sách bằng 1 query, rồi chạy thêm 1 query cho mỗi phần tử (ví dụ lấy tác giả cho 50 bài viết = 51 query). Khắc phục bằng JOIN, gom bằng `WHERE id IN (...)`, eager loading của ORM (`include`/`populate`), hoặc DataLoader trong GraphQL resolver. Ở front-end, lỗi tương tự xuất hiện dưới dạng request waterfall.

**8. Offset vs cursor pagination? / Phân trang offset và cursor khác nhau thế nào?**

EN: Offset (`LIMIT 20 OFFSET 1000`) is simple and supports jumping to a page number, but gets slower on deep pages and can skip or duplicate items when data changes. Cursor/keyset (`WHERE created_at < :last ORDER BY created_at DESC LIMIT 20`) uses an index, stays fast and stable, which suits infinite scroll, but cannot jump to an arbitrary page.

VI: Offset (`LIMIT 20 OFFSET 1000`) đơn giản và nhảy được tới số trang, nhưng chậm dần ở trang sâu và có thể bỏ sót hoặc lặp phần tử khi dữ liệu thay đổi. Cursor/keyset (`WHERE created_at < :last ORDER BY created_at DESC LIMIT 20`) dùng index, luôn nhanh và ổn định, hợp với cuộn vô hạn, nhưng không nhảy tới trang bất kỳ được.

**9. What is SQL injection and how do you prevent it? / SQL injection là gì và phòng chống thế nào?**

EN: Building SQL by concatenating user input lets an attacker change the query (e.g. `' OR 1=1 --`). Always use parameterized queries/prepared statements or a query builder/ORM, validate input, and run the app with a least-privilege database user.

VI: Ghép chuỗi SQL từ dữ liệu người dùng cho phép kẻ tấn công thay đổi câu truy vấn (ví dụ `' OR 1=1 --`). Luôn dùng parameterized query/prepared statement hoặc query builder/ORM, validate đầu vào, và chạy ứng dụng với user DB có quyền tối thiểu.

## 10. IQ & Logic Puzzles

Mẹo: người phỏng vấn chấm cách bạn suy luận nhiều hơn đáp án. Hãy nói to suy nghĩ, làm rõ giả định, thử với trường hợp nhỏ trước.

**1. Three switches outside a room control three bulbs inside. You may enter the room only once. How do you match them? / Ba công tắc bên ngoài điều khiển ba bóng đèn trong phòng, chỉ được vào phòng một lần. Làm sao biết công tắc nào ứng với bóng nào?**

EN: Turn switch A on for about 10 minutes, then turn it off and turn switch B on. Enter the room: the lit bulb is B, the off-but-warm bulb is A, the off-and-cold bulb is C. The trick is using a second property (heat) besides light.

VI: Bật công tắc A khoảng 10 phút rồi tắt, sau đó bật công tắc B. Vào phòng: bóng đang sáng là B, bóng tắt nhưng còn ấm là A, bóng tắt và nguội là C. Mấu chốt là dùng thêm một thuộc tính (nhiệt) ngoài ánh sáng.

**2. 8 identical-looking balls, one is heavier. Find it with a balance scale in 2 weighings. / Có 8 quả bóng giống nhau, một quả nặng hơn. Tìm nó bằng cân hai đĩa trong 2 lần cân.**

EN: Weigh 3 vs 3. If balanced, the heavy ball is among the remaining 2: weigh them against each other. If not balanced, take the heavier group of 3 and weigh 1 vs 1: if balanced, it is the third ball. Each weighing has 3 outcomes, so 2 weighings can distinguish up to 9 balls.

VI: Cân 3 với 3. Nếu cân bằng, quả nặng nằm trong 2 quả còn lại: cân hai quả đó với nhau. Nếu lệch, lấy nhóm 3 quả nặng hơn và cân 1 với 1: nếu cân bằng thì quả thứ ba là quả nặng. Mỗi lần cân có 3 kết quả, nên 2 lần cân phân biệt được tối đa 9 quả.

**3. Two ropes each burn in exactly 60 minutes but unevenly. Measure 45 minutes. / Hai sợi dây, mỗi sợi cháy hết đúng 60 phút nhưng không đều. Đo 45 phút thế nào?**

EN: Light rope A at both ends and rope B at one end at the same time. Rope A burns out after 30 minutes; at that moment light the other end of rope B. Its remaining 30 minutes now burn in 15 minutes, giving 30 + 15 = 45 minutes.

VI: Cùng lúc đốt dây A ở cả hai đầu và dây B ở một đầu. Dây A cháy hết sau 30 phút; ngay lúc đó đốt nốt đầu còn lại của dây B. Phần còn lại của B (tương đương 30 phút) sẽ cháy trong 15 phút, tổng cộng 30 + 15 = 45 phút.

**4. With a 3-litre jug and a 5-litre jug, measure exactly 4 litres. / Có bình 3 lít và bình 5 lít, đong đúng 4 lít thế nào?**

EN: Fill the 5L, pour into the 3L (5L now has 2). Empty the 3L and pour the 2 litres into it. Fill the 5L again and top up the 3L (needs 1 litre). The 5L jug now holds exactly 4 litres.

VI: Đổ đầy bình 5L, rót sang bình 3L (bình 5L còn 2 lít). Đổ bỏ bình 3L rồi rót 2 lít đó vào. Đổ đầy bình 5L lần nữa và rót cho đầy bình 3L (cần 1 lít). Bình 5L còn đúng 4 lít.

**5. 25 horses, a track that races 5 at a time, no timer. Minimum races to find the top 3? / 25 con ngựa, mỗi lượt đua tối đa 5 con, không có đồng hồ. Cần ít nhất bao nhiêu lượt để tìm 3 con nhanh nhất?**

EN: 7 races. Race 5 groups (5 races). Race the 5 group winners (race 6); the winner is the fastest overall. Only 5 horses can still be 2nd or 3rd: the 2nd and 3rd of race 6, the 2nd and 3rd from the overall winner's group, and the 2nd from the group of race 6's runner-up. Race them (race 7) and take the top 2.

VI: 7 lượt. Đua 5 nhóm (5 lượt). Đua 5 con thắng của các nhóm (lượt 6); con về nhất là nhanh nhất. Chỉ còn 5 con có thể đứng thứ 2 hoặc 3: hạng 2 và 3 của lượt 6, hạng 2 và 3 trong nhóm của con nhanh nhất, và hạng 2 trong nhóm của con về nhì ở lượt 6. Đua 5 con này (lượt 7) và lấy 2 con đầu.

**6. Four people cross a bridge at night with one torch; at most 2 cross at a time. Crossing times are 1, 2, 5 and 10 minutes. Minimum total time? / Bốn người qua cầu ban đêm với một cây đuốc, mỗi lần tối đa 2 người. Thời gian qua cầu là 1, 2, 5, 10 phút. Tổng thời gian tối thiểu?**

EN: 17 minutes: 1 and 2 cross (2), 1 returns (1), 5 and 10 cross (10), 2 returns (2), 1 and 2 cross (2). The key insight is sending the two slowest together.

VI: 17 phút: 1 và 2 qua (2), 1 quay lại (1), 5 và 10 qua (10), 2 quay lại (2), 1 và 2 qua (2). Ý chính là cho hai người chậm nhất đi cùng nhau.

**7. What is the angle between the hour and minute hands at 3:15? / Góc giữa kim giờ và kim phút lúc 3 giờ 15 là bao nhiêu?**

EN: 7.5°. The minute hand is at 90°. The hour hand moves 0.5° per minute, so it is at 3 × 30 + 15 × 0.5 = 97.5°. Difference: 7.5°.

VI: 7,5°. Kim phút ở 90°. Kim giờ đi 0,5° mỗi phút, nên ở vị trí 3 × 30 + 15 × 0,5 = 97,5°. Chênh lệch: 7,5°.

**8. Two eggs, a 100-floor building. Find the highest safe floor with the fewest drops in the worst case. / Có 2 quả trứng và toà nhà 100 tầng. Tìm tầng cao nhất thả trứng không vỡ với số lần thả ít nhất trong trường hợp xấu nhất.**

EN: 14 drops. Drop the first egg from floors 14, 27, 39, ... (each step one smaller), so the total drops stay constant whichever step it breaks at. Once it breaks, test the floors in between one by one with the second egg. 14 is the smallest n with n(n+1)/2 ≥ 100.

VI: 14 lần. Thả quả thứ nhất ở tầng 14, 27, 39, ... (mỗi bước giảm đi 1), để tổng số lần thả không đổi dù vỡ ở bước nào. Khi vỡ, dùng quả thứ hai thử lần lượt các tầng ở giữa. 14 là số n nhỏ nhất thoả n(n+1)/2 ≥ 100.

**9. What comes next: 2, 6, 12, 20, 30, ? / Số tiếp theo là gì: 2, 6, 12, 20, 30, ?**

EN: 42. The differences are 4, 6, 8, 10, 12; equivalently each term is n × (n + 1).

VI: 42. Hiệu giữa các số là 4, 6, 8, 10, 12; nói cách khác, mỗi số bằng n × (n + 1).

**10. An array contains 99 distinct numbers from 1 to 100. Find the missing one efficiently. / Một mảng có 99 số khác nhau từ 1 đến 100. Tìm số bị thiếu hiệu quả nhất.**

EN: Expected sum is 100 × 101 / 2 = 5050; the missing number is 5050 minus the array's sum. O(n) time and O(1) memory. XOR of 1..100 with all elements also works and avoids overflow for large n.

VI: Tổng đúng là 100 × 101 / 2 = 5050; số bị thiếu bằng 5050 trừ tổng của mảng. Độ phức tạp O(n) thời gian, O(1) bộ nhớ. Cũng có thể XOR các số 1..100 với mọi phần tử, tránh tràn số khi n lớn.
