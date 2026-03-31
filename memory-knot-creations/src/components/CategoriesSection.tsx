import { motion } from 'framer-motion';
import catCouples from '@/assets/cat-couples.jpg';
import catFriends from '@/assets/cat-friends.jpg';
import catFamily from '@/assets/cat-family.jpg';
import catOccasions from '@/assets/cat-occasions.jpg';

const categories = [
  { name: 'Gifts for Couples', image: catCouples, emoji: '💕' },
  { name: 'Gifts for Friends', image: catFriends, emoji: '🤝' },
  { name: 'Gifts for Family', image: catFamily, emoji: '🏠' },
  { name: 'Special Occasions', image: catOccasions, emoji: '🎂' },
];

const CategoriesSection = () => {
  return (
    <section id="categories" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Browse by</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            Gift Categories
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Find the perfect gift for every relationship and occasion
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#products"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 cursor-pointer bg-card"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                <span className="text-2xl">{cat.emoji}</span>
                <h3 className="font-heading text-sm lg:text-base font-semibold text-primary-foreground mt-1">
                  {cat.name}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
