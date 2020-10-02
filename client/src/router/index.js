import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/login";
import Header from '@/components/header';
import c from './collection';

import DDTable from '@/components/dd_table';
import Table from '@/components/dd_table/table';
import Table2 from '@/components/dd_table2/table';

//import { store } from "../store/store.js";

var baseRoutes = [
  {
    path: "/",
    components: {
      default: Login,

    }
  },

  {
    path: "/table",
    components: {
      header:Header,
      inner: DDTable,
    }
  },
  {
    path: "/table2",
    components: {
      header:Header,
      inner: Table2,
    }
  },
  {
    path: "/table/table",
    components: {
      header:Header,
      inner: Table,
    }
  },
];

const routes = baseRoutes.concat(c);

Vue.use(Router);

var router = new Router({
  mode: 'history',
  routes: routes
});

router.beforeEach((to, from, next) => {
  return next();
});

export default router;
