import Profile from "@/components/profile/profile";
import Header from '@/components/header';
import Footer from '@/components/footer';


export default [
  {
    path: "/profile",
    components: {
      default: Profile,
      header:Header,
      footer:Footer
    }
  }
];
