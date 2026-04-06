export default function buildFieldErrors(error) {
  const nextErrors = {};

  if (!error?.errors) {
    return nextErrors;
  }

  error.errors.forEach((item) => {
    if (item?.field) {
      nextErrors[item.field] = item.message;
    }
  });

  return nextErrors;
}
