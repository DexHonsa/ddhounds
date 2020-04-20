import Collection from "@/components/collection/collection";
import Templates from "@/components/collection/templates";
import AddClient from '@/components/collection/clients/add_client';
import ViewClient from '@/components/collection/clients/view_client';
import EditClient from '@/components/collection/clients/edit_client';
import Disputes from '@/components/collection/disputes';

import Payment from '@/components/collection/payment';
import Mail from '@/components/collection/mail';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Sidebar from '@/components/sidebar';
import MasterSearch from '@/components/collection/master_search';
import TransactionSearch from '@/components/collection/transactions_search';
export default [
  {
    path: "/collection/debtor",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: Collection,
        footer: Footer
    }
  },
  {
    path: "/collection/transactions",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: TransactionSearch,
      footer: Footer
    }
  },
  {
    path: "/collection/master_search",
    components: {
      header:Header,
      sidebar:Sidebar,
      inner: MasterSearch,
      footer: Footer
    }
  },
  {
    path: "/collection/disputes",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: Disputes,
        footer: Footer
    }
  },

  {
    path: "/collection/payment",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: Payment,
        footer: Footer
    }
  },
  {
    path: "/collection/mail",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: Mail,
        footer: Footer
    }
  },
  {
    path: "/collection/clients/add",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: AddClient,
        footer: Footer
    }
  },
  {
    path: "/collection/clients/:id",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: ViewClient,
        footer: Footer
    }
  },
  {
    path: "/collection/clients/edit/:id",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: EditClient,
        footer: Footer
    }
  },
  {
    path: "/collection/templates",
    components: {
        header:Header,
        sidebar:Sidebar,
        inner: Templates,
        footer: Footer
    }
  }
];
