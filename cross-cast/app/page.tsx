import { GenericPost } from '../types/all'
import MainContainer from '@/components/MainContainer';

export default async function Home() {
  let data = [] as GenericPost[];
  try {
    data = await (await fetch(`${process.env.NEXT_PUBLIC_URL}/api/integrations?days=7`, { next: { revalidate: 30 }})).json() as GenericPost[];
  } catch(err) {
    console.error(err)
  }
  // console.log(JSON.stringify(data));

  // const direction = Math.round(Math.random() * 360); //To output a volue between 0 and 360 in degrees to be given to the linear-gradient.

  const r1 = Math.round(Math.random() * 255); // Math.random() outputs a numer between 0(inclusive) & 1(exclusive) with around 17 decimal digits.
  const g1 = Math.round(Math.random() * 255); // We take this number and multiply it by 255. This number can never go above 255.
  const b1 = Math.round(Math.random() * 255); // We have a decimal number with we make an integer with Math.round() which rounds off the previous output.
  // to add random transparency to the image;         // This output is a whole number between 0 & 255 and can be assigned as values for the rgba() property.
  const a1 = Math.round(Math.random() * 10) / 10; //  *** for alpha values we need between 0 & 1 so we multiply the random number with 10 so as to get a value X.xxxxx, round it off so as to X and then                                                                divide it by 10 to get a decimal number or 1. ***  //

  const r2 = Math.round(Math.random() * 255);
  const g2 = Math.round(Math.random() * 255);
  
  const b2 = Math.round(Math.random() * 255);
  // to add random transparency to the image;
  const a2 = Math.round(Math.random() * 10) / 10;
  
  return (
    <main style={{ background: `linear-gradient(to bottom, rgba(${r1},${g1},${b1},${a1}), rgba(${r2},${g2},${b2},${a2}))` }}>
        <MainContainer posts={data} />
    </main>
  )
}
