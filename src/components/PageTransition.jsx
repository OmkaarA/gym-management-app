import { motion } from 'framer-motion';
import { useTransition } from '../context/TransitionContext';

const slideFromRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { 
    x: '0%', 
    opacity: 1, 
    transition: { type: "spring", stiffness: 120, damping: 20 }
  },
  exit: { 
    x: '-100%', 
    opacity: 0, 
    transition: { duration: 0.3 } 
  }
};

const slideFromLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { 
    x: '0%', 
    opacity: 1, 
    transition: { type: "spring", stiffness: 120, damping: 20 }
  },
  exit: { 
    x: '100%', 
    opacity: 0, 
    transition: { duration: 0.3 } 
  }
};

const PageTransition = ({ children }) => {
	const { direction } = useTransition();
	const variants = direction === "left" ? slideFromLeft : slideFromRight;
  return (
	<motion.div 
	variants={variants}
	initial="initial"
	  animate="animate"
	  exit="exit"
	  style={{ position: 'absolute', width: '100%' }}
	>
	  {children}

	</motion.div>
	  );
};

export default PageTransition;