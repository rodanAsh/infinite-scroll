import { useState, useEffect, useRef, useCallback } from 'react';
import type { Post } from '../types';
import axiosInstance from '../axiosInstance';


const InfiniteScroll = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    

    const fetchPosts = async (pageNum: number) => {

        setLoading(true);

        try {
            const response = await axiosInstance.get('/posts',{
                params: {
                    _page: pageNum,
                    _limit: 10
                }
            });
            console.log(response.data);
            
            setPosts((prev) => ([...prev, ...response.data]));
            if (response.data.length < 10) {
                setHasMore(false);
            }
        } catch(error) {
            setError("An error occured while fetching data.");
        } finally {
            setLoading(false);
        }
        
    }

    useEffect(() => {
        fetchPosts(page);
    }, [page])

    const observer = useRef<IntersectionObserver | null>(null);

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {

        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        },{
            threshold: 1.0
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div className='p-4'>
            {
                posts.map((post,index) => {
                    if (posts.length === index + 1) {
                        return (
                            <div
                                ref={lastPostElementRef}
                                key={String(post.id)}
                                className='border-b py-4 hover:bg-gray-100 transition duration-200'
                            >
                                <h2 className='text-lg md:text-xl font-bold'>{post.title}</h2>
                                <p className='text-gray-700'>{post.body}</p>
                            </div>
                        );
                    } else {
                        return (
                            <div 
                                key={String(post.id)}
                                className='border-b py-4 hover:bg-gray-100 transition duration-200'
                            >
                                <h2 className='text-lg md:text-xl font-bold'>{post.title}</h2>
                                <p className='text-gray-700'>{post.body}</p>
                            </div>
                        )
                    }
                })
            }

            {
                loading && <p className='text-center py-4 animate-pulse'>Loading...</p>
            }

            {
                error && <p className='text-center text-red-500 py-4'>{error}</p>
            }
        </div>
    )
}

export default InfiniteScroll;