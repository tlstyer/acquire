import EnzymeAdapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';

export function configureEnzyme() {
  configure({ adapter: new EnzymeAdapter() });
}
