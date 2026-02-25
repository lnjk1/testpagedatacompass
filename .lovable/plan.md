

# Fix: Stapnummers worden afgesneden

## Probleem
De stapnummers (1, 2, 3) zijn gepositioneerd met `absolute -top-2 -left-2`, waardoor ze buiten de grenzen van hun kaart vallen. De parent `CardContent` met `overflow-x-auto` knipt deze af.

## Oplossing
Twee kleine aanpassingen:

1. **`LineageFlow.tsx`** (regel 31): Voeg `pt-3 pl-3` padding toe aan de wrapper-div, zodat de absolute-gepositioneerde badges ruimte hebben:
   - Van: `className="flex flex-wrap items-start gap-2"`
   - Naar: `className="flex flex-wrap items-start gap-2 pt-3 pl-3"`

Dit geeft de nummerbadges voldoende ruimte zonder de layout te breken.

