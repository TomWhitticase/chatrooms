import Loading from "react-loading";

export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loading type="spin" color={"#3B82F6"} height={64} width={64} />
    </div>
  );
}
