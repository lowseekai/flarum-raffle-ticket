import UserPage from 'flarum/forum/components/UserPage';
import RaffleHistoryList from './RaffleHistoryList';

export default class UserRaffleHistoryPage extends UserPage {
  oninit(vnode) {
    super.oninit(vnode);
    this.loadUser(m.route.param('username'));
  }

  content() {
    return <RaffleHistoryList />;
  }
}
