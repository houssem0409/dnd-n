import { listToBeReseted } from "../defaultStoreData";

const reset = (slices) => (store) => (next) => (action) => {
  let result = null;

  if (action.type === "reset") {
    try {
      listToBeReseted.forEach((slice) => {
        store.dispatch({
          type: `${slice}/reset`,
        });
      });
    } catch (error) {
      console.error("error--------------", error);
    }
  }

  result = next(action);

  return result;
};

export default reset;
