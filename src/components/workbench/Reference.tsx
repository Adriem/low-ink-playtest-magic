const Reference = ({ imageUrl }: { imageUrl?: string }) => {
  return imageUrl ? <img alt="Reference card" src={imageUrl} style={{ width: '100%', height: 'auto' }} /> : null;
};

export default Reference;
