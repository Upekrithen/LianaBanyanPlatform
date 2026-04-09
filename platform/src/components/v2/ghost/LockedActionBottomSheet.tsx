import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type LockedActionBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel: string | null;
};

export function LockedActionBottomSheet({
  open,
  onOpenChange,
  actionLabel,
}: LockedActionBottomSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="md:hidden">
        <DrawerHeader>
          <DrawerTitle>Preview mode.</DrawerTitle>
          <DrawerDescription>
            Members can respond, launch, and transact here.
            {actionLabel ? ` This action is "${actionLabel}."` : ""}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button asChild>
            <a href="/membership">Join for $5/year.</a>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue browsing.
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
