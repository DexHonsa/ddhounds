import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/login";
import Signup from "@/components/signup";
import Header from '@/components/header';
import Dashboard from '@/components/dashboard/dashboard';
import AdminDashboard from '@/components/dashboard/admin_dashboard';
import Timesheet from '@/components/timesheet';
import Clock from '@/components/clock';
import Sidebar from '@/components/sidebar';
 // import Covert from '../components/convert';
import CollectionRoutes from './collection'
import Footer from '@/components/footer';
import Profile from '@/components/profile';
import UserActivity from '@/components/user_management/user_activity';
import Keys from '@/components/keys';
import UserManagement from '@/components/user_management';
import SendMail from '@/components/collection/clients/send_mail';
import Upload from '@/components/upload';
import Notifications from '@/components/notifications';
import Forgot from '@/components/forgot';
import ResetPassword from '@/components/reset_password';
import NewAccount from '@/components/new_account';
import DDTable from '@/components/dd_table';
import Table from '@/components/dd_table/table';
import Table2 from '@/components/dd_table2/table';

//import { store } from "../store/store.js";

var baseRoutes = [
  {
    path: "/",
    components: {
      default: Login,
      footer:Footer
    }
  },
  {
    path: "/timesheet",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Timesheet,
      footer: Footer
    }
  },
  {
    path: "/table",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: DDTable,
      footer: Footer
    }
  },
  {
    path: "/table2",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Table2,
      footer: Footer
    }
  },
  {
    path: "/table/table",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Table,
      footer: Footer
    }
  },
  {
    path: "/clock",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Clock,
      footer: Footer
    }
  },
  {
    path: "/upload",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Upload,
      footer: Footer
    }
  },
  {
    path: "/send_mail/:id",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: SendMail,
      footer: Footer
    }
  },
  {
    path: "/register",
    components: {
      default: Signup,
      footer:Footer
    }
  },
  {
    path: "/forgot",
    components: {
      default: Forgot,
      footer:Footer
    }
  },
  {
    path: "/reset_password",
    components: {
      default: ResetPassword,
      footer:Footer
    }
  },
  {
    path: "/new_account/:id",
    components: {
      default: NewAccount,
      footer:Footer
    }
  },
  {
    path: "/profile",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Profile,
      footer: Footer
    }
  },
  {
    path: "/user_activity/:id",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: UserActivity,
      footer: Footer
    }
  },
  {
    path: "/keys",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Keys,
      footer: Footer
    }
  },
  {
    path: "/user_management",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: UserManagement,
      footer: Footer
    }
  },
  {
    path: "/notifications",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Notifications,
      footer: Footer
    }
  },
  {
    path: "/dashboard",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: Dashboard,
      footer: Footer
    }
  },
  
  {
    path: "/admin_dashboard",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: AdminDashboard,
      footer: Footer
    }
  },

];

const routes = baseRoutes.concat(CollectionRoutes)

Vue.use(Router);

var router = new Router({
  mode: 'history',
  routes: routes
});

router.beforeEach((to, from, next) => {
  return next();
});

export default router;
