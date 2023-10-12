import reset from "./reset";

const middlewares = [reset];

const getMiddlewaresArray =
  (middlewares) =>
  (slices = {}) => {
    return middlewares.map((middleware) => {
      return middleware(slices);
    });
  };

export default getMiddlewaresArray(middlewares);
