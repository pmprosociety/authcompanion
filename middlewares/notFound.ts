export default ({ response }: any) => {
  response.status = 404;
  response.body = {
    errors: [{
      title: "Internal Server Error",
      detail: "Not Found",
    }],
  };
};
