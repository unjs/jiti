// Test Explicit Resource Management (using keyword)
// TC39 Proposal: https://github.com/tc39/proposal-explicit-resource-management

const disposalOrder: string[] = [];

class DisposableResource implements Disposable {
  name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`Creating resource: ${name}`);
  }

  [Symbol.dispose](): void {
    disposalOrder.push(this.name);
    console.log(`Disposing resource: ${this.name}`);
  }
}

class AsyncDisposableResource implements AsyncDisposable {
  name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`Creating async resource: ${name}`);
  }

  async [Symbol.asyncDispose](): Promise<void> {
    disposalOrder.push(this.name);
    console.log(`Async disposing resource: ${this.name}`);
  }
}

function testUsingDeclaration() {
  console.log("--- Testing using declaration ---");
  using resource = new DisposableResource("sync-resource");
  console.log(`Using resource: ${resource.name}`);
}

async function testAwaitUsingDeclaration() {
  console.log("--- Testing await using declaration ---");
  await using resource = new AsyncDisposableResource("async-resource");
  console.log(`Using async resource: ${resource.name}`);
}

function testMultipleResources() {
  console.log("--- Testing multiple resources (LIFO order) ---");
  using first = new DisposableResource("first");
  using second = new DisposableResource("second");
  using third = new DisposableResource("third");
  console.log(
    `Resources created: ${first.name}, ${second.name}, ${third.name}`,
  );
}

testUsingDeclaration();
console.log(`Disposal order: ${disposalOrder.join(", ")}`);
disposalOrder.length = 0;

testMultipleResources();
console.log(`Disposal order (should be LIFO): ${disposalOrder.join(", ")}`);
disposalOrder.length = 0;

testAwaitUsingDeclaration().then(() => {
  console.log(`Async disposal order: ${disposalOrder.join(", ")}`);
});

export { DisposableResource, AsyncDisposableResource };
