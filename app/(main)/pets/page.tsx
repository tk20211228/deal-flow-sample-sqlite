import PetCard from "@/components/pet-card";
import { Pet } from "../../types/pet";

export default function PetsPage() {
  const mockPets: Pet[] = [
    {
      id: "1",
      name: "Buddy",
      type: "dog",
      hp: 100,
      ownerId: "1",
    },
    {
      id: "2",
      name: "Whiskers",
      type: "cat",
      hp: 100,
      ownerId: "1",
    },
    {
      id: "3",
      name: "Fluffy",
      type: "dog",
      hp: 100,
      ownerId: "1",
    },
    {
      id: "4",
      name: "Max",
      type: "cat",
      hp: 100,
      ownerId: "1",
    },
    {
      id: "5",
      name: "Bella",
      type: "dog",
      hp: 100,
      ownerId: "1",
    },
  ];
  return (
    <div className="container my-10">
      <div className="grid grid-cols-3 gap-4">
        {mockPets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
