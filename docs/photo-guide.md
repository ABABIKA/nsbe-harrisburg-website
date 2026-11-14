# Adding chapter photos

The "Chapter photos" slideshow on the About NSBE page shows every picture in one folder. There is nothing else to set up.

## Add photos

1. Put image files in `public/images/gallery/`.
2. Use JPG, PNG, or WebP. Resize photos to about 1600 pixels wide and under 500 KB each so the page loads quickly.
3. Photos show in file-name order. Start names with numbers to control the order: `01-gbm-opening.jpg`, `02-volunteer-day.jpg`. (`photo-2` sorts before `photo-10`.)
4. Commit and push the new files like any other change. If the folder is empty, the slideshow section does not appear.

## Describe each photo (accessibility)

Screen reader users hear a description of each photo. Without one, the file name is used ("02 volunteer day"). To write real descriptions, add a file named `captions.json` in the same folder:

```json
{
  "01-gbm-opening.jpg": "Members seated at the first general body meeting of the semester",
  "02-volunteer-day.jpg": "Five members sorting donations at the Harrisburg Community Center"
}
```

Say what a person would see, in one sentence. Do not start with "Image of".

## Before you add a photo

- Ask the people in it for permission, especially for a page that will be public.
- Flyers and graphics with a lot of small text are hard to read in a slideshow. Real event photos work best.
- Do not use the NSBE logo as a slideshow image, and do not edit or stretch it.

## Why a folder and not an Instagram feed

A feed pulls in every post, including flyers, and needs a Meta developer account and access tokens that expire. A folder lets the chapter choose exactly what shows.

## How the slideshow behaves

- It moves to the next photo every 5 seconds, and stops while someone points at it or tabs into it.
- There are Previous, Next, and Pause buttons.
- For visitors who set their device to reduce motion, it never moves by itself.
