import { CircularProgress } from "@nextui-org/progress";

interface LoaderWithTextProps {
  text?: string;
}

function LoaderWithText({ text = "Loading" }: LoaderWithTextProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <CircularProgress
        classNames={{
          base: "animate-spin",
          svg: "w-36 h-36 ",
          indicator: "stroke-secondary",
          track: "stroke-secondary/20",
        }}
        strokeWidth={2}
        disableAnimation={true}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-center text-lg font-medium">{text}</span>
      </div>
    </div>
  );
}

export default LoaderWithText;
