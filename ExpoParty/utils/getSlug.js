import { Constants } from 'expo';

function getSlug() {
  const { manifest: { slug } } = Constants;
  return 'users'; //slug;
}
export default getSlug;
