import { User } from "@/lib/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { getAvatarUrl } from "@/lib/avatar";

export function UserCard({ user }: { user: User }) {
  const { text, url } = getAvatarUrl({
    email: user.email,
  });
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src={url} />
          <AvatarFallback>{text}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
