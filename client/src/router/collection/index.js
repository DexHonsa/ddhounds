import Collection from "@/components/collection/collection";
import Header from '@/components/header';
export default [
  {
    path: "/search",
    components: {
        header:Header,
        inner: Collection,
    }
  },
  
  
];
