import { configure } from 'enzyme';
import * as EnzymeAdapter from 'enzyme-adapter-react-16';

export function configureEnzyme() {
    configure({ adapter: new EnzymeAdapter() });
}
