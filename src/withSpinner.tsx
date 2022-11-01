import { PuffLoader } from "react-spinners";

export function withSpinner<T extends Object>(
  WrappedComponent: React.ComponentType<T>
) {
  const ComponentWithSpinner = (maybeProps: T | null) => {
    if (maybeProps === null) {
      return <PuffLoader />;
    } else {
      return <WrappedComponent {...maybeProps} />;
    }
  };
  return ComponentWithSpinner;
}
