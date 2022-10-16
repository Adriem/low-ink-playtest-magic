import { Colors } from './colors';

export const getColorIdentityStyle = (ctx, colorIdentity, { devoid } = {}) => {
  switch (colorIdentity) {
  case 'white': return Colors.WHITE;
  case 'blue': return Colors.BLUE;
  case 'black': return Colors.BLACK;
  case 'red': return Colors.RED;
  case 'green': return Colors.GREEN;

  case 'gruul':
    const gruulGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gruulGradient.addColorStop(.4, Colors.RED);
    gruulGradient.addColorStop(.6, Colors.GREEN);
    return gruulGradient;

  case 'izzet':
    const izzetGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    izzetGradient.addColorStop(.4, Colors.BLUE);
    izzetGradient.addColorStop(.6, Colors.RED);
    return izzetGradient;

  case 'rakdos':
    const rakdosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    rakdosGradient.addColorStop(.4, Colors.BLACK);
    rakdosGradient.addColorStop(.6, Colors.RED);
    return rakdosGradient;

  case 'orzhov':
    const orzhovGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    orzhovGradient.addColorStop(.4, Colors.WHITE);
    orzhovGradient.addColorStop(.6, Colors.BLACK);
    return orzhovGradient;

  case 'golgari':
    const golgariGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    golgariGradient.addColorStop(.4, Colors.BLACK);
    golgariGradient.addColorStop(.6, Colors.GREEN);
    return golgariGradient;

  case 'azorius':
    const azoriusGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    azoriusGradient.addColorStop(.4, Colors.WHITE);
    azoriusGradient.addColorStop(.6, Colors.BLUE);
    return azoriusGradient;

  case 'simic':
    const simicGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    simicGradient.addColorStop(.4, Colors.GREEN);
    simicGradient.addColorStop(.6, Colors.BLUE);
    return simicGradient;

  case 'selesnya':
    const selesnyaGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    selesnyaGradient.addColorStop(.4, Colors.GREEN);
    selesnyaGradient.addColorStop(.6, Colors.WHITE);
    return selesnyaGradient;

  case 'dimir':
    const dimigGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    dimigGradient.addColorStop(.4, Colors.BLUE);
    dimigGradient.addColorStop(.6, Colors.BLACK);
    return dimigGradient;

  case 'boros':
    const borosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    borosGradient.addColorStop(.4, Colors.RED);
    borosGradient.addColorStop(.6, Colors.WHITE);
    return borosGradient;

  case 'artifact': return Colors.ARTIFACT;
  case 'land': return Colors.LAND;
  case 'colorless': return Colors.COLORLESS;
  case 'multi': return Colors.MULTI;
  default: return Colors.COLORLESS;
  }
};

