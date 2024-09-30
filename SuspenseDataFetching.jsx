import { useMemo, Suspense } from "react";

// Helper function to create a resource that Suspense can manage
const createResource = (promise) => {
  let status = "pending";
  let result;
  let suspender = promise
    .then((data) => {
      status = "success";
      result = data;
    })
    .catch((error) => {
      status = "error";
      result = error;
    });

  return {
    read() {
      if (status === "pending") {
        throw suspender; // Suspend the component
      } else if (status === "error") {
        throw result; // Throw the error if the promise failed
      } else if (status === "success") {
        return result; // Return the data if successful
      }
    },
  };
};

// Simulate fetching data from an API with a delay
function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ title: "Hello World", body: "This is a test post" });
    }, 2000);
  });
}

// Custom hook to fetch data with Suspense support
const useSuspenseFetch = (url) => {
  const resource = useMemo(() => {
    const promise = fetchData(url);
    return createResource(promise);
  }, [url]);

  return resource;
};

function Post() {
  const resource = useSuspenseFetch(
    "https://jsonplaceholder.typicode.com/posts/1"
  );

  // The resource is guaranteed to be ready or throw a promise if not
  const post = resource.read();

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Post />
      </Suspense>
    </div>
  );
}

export default App;
