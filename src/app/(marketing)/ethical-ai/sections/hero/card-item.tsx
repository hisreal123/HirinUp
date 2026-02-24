import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CardItem({
  icon,
  title,
  desc,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border p-2 border-white/15 h-full
      bg-transparent bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] backdrop-blur-xl shadow-xl transition`}
    >
      <CardHeader className="pb-3">
        <div className="mb-6 h-15 w-16 text-white">{icon}</div>
        <CardTitle className="text-[20px] leading-[31px] text-left  text-white">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-[16px] text-left leading-[27px] text-white/70">
          {desc}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
