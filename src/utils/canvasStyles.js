import { Colors } from './colors';

export const getColorIdentityStyle = (ctx, colorIdentity, { devoid, palette = Colors } = {}) => {
  switch (colorIdentity) {
  case 'white': return palette.WHITE;
  case 'blue': return palette.BLUE;
  case 'black': return palette.BLACK;
  case 'red': return palette.RED;
  case 'green': return palette.GREEN;

  case 'gruul':
    const gruulGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gruulGradient.addColorStop(.4, palette.RED);
    gruulGradient.addColorStop(.6, palette.GREEN);
    return gruulGradient;

  case 'izzet':
    const izzetGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    izzetGradient.addColorStop(.4, palette.BLUE);
    izzetGradient.addColorStop(.6, palette.RED);
    return izzetGradient;

  case 'rakdos':
    const rakdosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    rakdosGradient.addColorStop(.4, palette.BLACK);
    rakdosGradient.addColorStop(.6, palette.RED);
    return rakdosGradient;

  case 'orzhov':
    const orzhovGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    orzhovGradient.addColorStop(.4, palette.WHITE);
    orzhovGradient.addColorStop(.6, palette.BLACK);
    return orzhovGradient;

  case 'golgari':
    const golgariGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    golgariGradient.addColorStop(.4, palette.BLACK);
    golgariGradient.addColorStop(.6, palette.GREEN);
    return golgariGradient;

  case 'azorius':
    const azoriusGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    azoriusGradient.addColorStop(.4, palette.WHITE);
    azoriusGradient.addColorStop(.6, palette.BLUE);
    return azoriusGradient;

  case 'simic':
    const simicGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    simicGradient.addColorStop(.4, palette.GREEN);
    simicGradient.addColorStop(.6, palette.BLUE);
    return simicGradient;

  case 'selesnya':
    const selesnyaGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    selesnyaGradient.addColorStop(.4, palette.GREEN);
    selesnyaGradient.addColorStop(.6, palette.WHITE);
    return selesnyaGradient;

  case 'dimir':
    const dimigGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    dimigGradient.addColorStop(.4, palette.BLUE);
    dimigGradient.addColorStop(.6, palette.BLACK);
    return dimigGradient;

  case 'boros':
    const borosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    borosGradient.addColorStop(.4, palette.RED);
    borosGradient.addColorStop(.6, palette.WHITE);
    return borosGradient;

  case 'artifact': return palette.ARTIFACT;
  case 'land': return palette.LAND;
  case 'colorless': return palette.COLORLESS;
  case 'multi': return palette.MULTI;
  default: return palette.COLORLESS;
  }
}
