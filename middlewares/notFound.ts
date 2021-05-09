export default ({ response }: any) => {
  response.status = 404;
  response.body = {
    errors: [{
      title: "Path not found",
      detail: "Not Found",
    }],
  };
};
