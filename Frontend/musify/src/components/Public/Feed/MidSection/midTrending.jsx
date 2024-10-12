import React from 'react'
import axiosInstance from '../../../../axios/authInterceptor';
import PostCard from '../InnerComponents/PostCard';
import LoadingSpinner from '../../Profile/InnerComponents/LoadingSpinner';
import EmptyState from '../../Profile/InnerComponents/EmptyState';

function MidTrending() {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/content/trending');
        console.log("Fetched posts:", response.data);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      {posts.map((post)=> (
        <PostCard key={post.id} post={post} />
      ))}

    </div>
  )
}

export default MidTrending;