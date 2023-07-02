const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const DIY = await prisma.Provincies.upsert({
    where: {
      provincy: "DI Yogyakarta",
    },
    update: {},
    create: {
      provincy: "DI Yogyakarta",
      city: {
        create: [
          {
            city: "Kota Yogyakarta",
          },
          {
            city: "Kab. Sleman",
          },
          {
            city: "Kab. Gunung Kidul",
          },
          {
            city: "Kab. Bantul",
          },
          {
            city: "Kab. Kulon Progo",
          },
        ],
      },
    },
  })
  console.log(DIY)
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.log(e)
    await prisma.$disconnect()
    process.exit(1)
  })
